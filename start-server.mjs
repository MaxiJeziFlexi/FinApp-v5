// Simplified server starter to bypass dependency issues temporarily
import { spawn } from 'child_process';

console.log('Starting FinApp server migration...');

// Try to run with npx tsx (which downloads tsx automatically)
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});