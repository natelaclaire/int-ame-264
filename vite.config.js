import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { spawn } from 'child_process';

const cmsCollections = new Set(['learningOutcomes', 'modules', 'resources', 'assignments', 'syllabi', 'writings', 'radio']);
const cmsDocumentFolders = new Set(['assignments', 'syllabi', 'writings']);

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10_000_000) reject(new Error('Request is too large'));
    });
    req.on('end', () => resolveBody(body));
    req.on('error', reject);
  });
}

function sendJson(res, status, value) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(value));
}

function localCmsPlugin() {
  return {
    name: 'local-course-cms',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__cms/')) return next();
        try {
          const url = new URL(req.url, 'http://localhost');
          const parts = url.pathname.split('/').filter(Boolean);

          if (parts[1] === 'data' && cmsCollections.has(parts[2])) {
            const file = resolve(__dirname, 'data', `${parts[2]}.json`);
            if (req.method === 'GET') return sendJson(res, 200, JSON.parse(readFileSync(file, 'utf8')));
            if (req.method === 'PUT') {
              const parsed = JSON.parse(await readBody(req));
              if (!Array.isArray(parsed)) return sendJson(res, 400, { error: 'Collection data must be an array.' });
              writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
              return sendJson(res, 200, { saved: true, count: parsed.length });
            }
          }

          if (parts[1] === 'documents' && cmsDocumentFolders.has(parts[2]) && req.method === 'GET') {
            const folder = resolve(__dirname, 'data', parts[2]);
            const files = readdirSync(folder).filter(file => file.endsWith('.md')).sort();
            return sendJson(res, 200, files);
          }

          if (parts[1] === 'document' && cmsDocumentFolders.has(parts[2]) && parts[3]) {
            const filename = basename(decodeURIComponent(parts[3]));
            if (!filename.endsWith('.md')) return sendJson(res, 400, { error: 'Only Markdown documents are supported.' });
            const file = resolve(__dirname, 'data', parts[2], filename);
            if (req.method === 'GET') return sendJson(res, 200, { filename, content: readFileSync(file, 'utf8') });
            if (req.method === 'PUT') {
              const { content } = JSON.parse(await readBody(req));
              if (typeof content !== 'string') return sendJson(res, 400, { error: 'Document content must be text.' });
              writeFileSync(file, content, 'utf8');
              return sendJson(res, 200, { saved: true });
            }
          }

          if (parts[1] === 'build-epub' && req.method === 'POST') {
            const child = spawn(process.execPath, [resolve(__dirname, 'scripts/build-epub.mjs')], { cwd: __dirname });
            let output = '';
            let error = '';
            child.stdout.on('data', chunk => { output += chunk; });
            child.stderr.on('data', chunk => { error += chunk; });
            child.on('close', code => sendJson(res, code === 0 ? 200 : 500, code === 0 ? { built: true, message: output.trim() } : { error: error || 'ePub build failed.' }));
            return;
          }

          return sendJson(res, 404, { error: 'CMS endpoint not found.' });
        } catch (error) {
          return sendJson(res, 500, { error: error.message });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    localCmsPlugin(),
    {
      name: 'copy-data',
      closeBundle() {
        // Copy data/*.json to dist/data/ after build
        const dataDir = resolve(__dirname, 'dist/data');
        try {
          mkdirSync(dataDir, { recursive: true });
          ['learningOutcomes.json', 'modules.json', 'resources.json', 'assignments.json', 'syllabi.json'].forEach(file => {
            copyFileSync(
              resolve(__dirname, 'data', file),
              resolve(dataDir, file)
            );
          });
          
          // Copy assignments folder
          const assignmentsDir = resolve(__dirname, 'data/assignments');
          const distAssignmentsDir = resolve(dataDir, 'assignments');
          mkdirSync(distAssignmentsDir, { recursive: true });
          readdirSync(assignmentsDir).forEach(file => {
            copyFileSync(
              resolve(assignmentsDir, file),
              resolve(distAssignmentsDir, file)
            );
          });

          // Copy syllabi folder
          const syllabiDir = resolve(__dirname, 'data/syllabi');
          const distSyllabiDir = resolve(dataDir, 'syllabi');
          mkdirSync(distSyllabiDir, { recursive: true });
          readdirSync(syllabiDir).forEach(file => {
            copyFileSync(
              resolve(syllabiDir, file),
              resolve(distSyllabiDir, file)
            );
          });

          // Copy writing Markdown files
          const writingsDir = resolve(__dirname, 'data/writings');
          const distWritingsDir = resolve(dataDir, 'writings');
          mkdirSync(distWritingsDir, { recursive: true });
          readdirSync(writingsDir).forEach(file => {
            copyFileSync(
              resolve(writingsDir, file),
              resolve(distWritingsDir, file)
            );
          });

          // GitHub Pages SPA fallback: serve app shell for unknown routes.
          copyFileSync(
            resolve(__dirname, 'dist', 'index.html'),
            resolve(__dirname, 'dist', '404.html')
          );
          
          console.log('✓ Copied data/*.json, Markdown document folders, and SPA 404 fallback');
        } catch (err) {
          console.error('Failed to copy data files:', err);
        }
      }
    }
  ],
});
