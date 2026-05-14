/**
 * ResQAI — Server Entry Point
 * 
 * This is the production server launcher.
 * It starts the Express backend from the ../backend/ directory.
 * 
 * Usage:
 *   node server/server.js         (from project root)
 *   node server.js                (from server/ directory)
 *
 * For development, use: cd backend && npm run dev
 */

import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendEntry = resolve(__dirname, '..', 'backend', 'server.js');

console.log('🚀 ResQAI Server Launcher');
console.log(`📂 Loading backend from: ${backendEntry}\n`);

// Dynamically import the backend server
await import(pathToFileURL(backendEntry).href);
