import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';
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
          ['learningOutcomes.json', 'modules.json', 'resources.json'].forEach(file => {
            copyFileSync(
              resolve(__dirname, 'data', file),
              resolve(dataDir, file)
            );
          });
          console.log('✓ Copied data/*.json to dist/data/');
        } catch (err) {
          console.error('Failed to copy data files:', err);
        }
      }
    }
  ],
});
