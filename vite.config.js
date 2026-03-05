import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
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

          // GitHub Pages SPA fallback: serve app shell for unknown routes.
          copyFileSync(
            resolve(__dirname, 'dist', 'index.html'),
            resolve(__dirname, 'dist', '404.html')
          );
          
          console.log('✓ Copied data/*.json, data/assignments/, data/syllabi/, and SPA 404 fallback');
        } catch (err) {
          console.error('Failed to copy data files:', err);
        }
      }
    }
  ],
});
