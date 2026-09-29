// runner.js
// Local microservice orchestrator runner for development and integration testing
// Starts all individual microservices and the API Gateway in coordinated background child processes

const { fork } = require('child_process');
const path = require('path');

const SERVICES = [
  { name: 'auth-service', port: 3001, path: 'dist/services/auth-service/src/index.js' },
  { name: 'user-service', port: 3002, path: 'dist/services/user-service/src/index.js' },
  { name: 'scenario-service', port: 3003, path: 'dist/services/scenario-service/src/index.js' },
  { name: 'simulation-service', port: 3004, path: 'dist/services/simulation-service/src/index.js' },
  { name: 'progress-service', port: 3005, path: 'dist/services/progress-service/src/index.js' },
  { name: 'consultant-service', port: 3006, path: 'dist/services/consultant-service/src/index.js' },
  { name: 'certificate-service', port: 3007, path: 'dist/services/certificate-service/src/index.js' },
  { name: 'fraud-reporting-service', port: 3008, path: 'dist/services/fraud-reporting-service/src/index.js' },
  { name: 'fraud-intelligence-service', port: 3009, path: 'dist/services/fraud-intelligence-service/src/index.js' },
  { name: 'voice-service', port: 3010, path: 'dist/services/voice-service/src/index.js' },
  { name: 'notification-service', port: 3011, path: 'dist/services/notification-service/src/index.js' },
  { name: 'media-service', port: 3012, path: 'dist/services/media-service/src/index.js' },
  { name: 'api-gateway', port: 5000, path: 'dist/services/api-gateway/src/index.js' },
];

const children = [];

console.log('════════════════════════════════════════════════════════════════');
console.log('🚀 Starting Anti-Scam Uzbekistan Microservices Ecosystem');
console.log('════════════════════════════════════════════════════════════════');

SERVICES.forEach((svc) => {
  const env = {
    ...process.env,
    PORT: svc.port,
    NODE_ENV: 'development',
  };

  const child = fork(path.resolve(__dirname, svc.path), [], {
    env,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`[${svc.name}] Process error:`, err);
  });

  children.push({ name: svc.name, process: child });
});

process.on('SIGINT', () => {
  console.log('\nStopping microservices...');
  children.forEach(({ process: p }) => p.kill('SIGINT'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  children.forEach(({ process: p }) => p.kill('SIGTERM'));
  process.exit(0);
});
