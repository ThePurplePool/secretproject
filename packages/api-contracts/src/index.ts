// packages/api-contracts/src/index.ts
// Aggregated OpenAPI 3.0 specification for Anti-Scam Uzbekistan API Gateway

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Anti-Scam Uzbekistan Public API Gateway',
    version: '1.0.0',
    description:
      'National cybersecurity interactive platform microservice API Gateway for combating fraud, phishing, social engineering, and financial cybercrimes in Uzbekistan.',
    contact: {
      name: 'Anti-Scam Uzbekistan Security Operations',
      url: 'https://anti-scam.uz',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production API Gateway v1',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Gateway & Downstream Health Check',
        responses: {
          '200': { description: 'All services healthy' },
          '503': { description: 'One or more downstream services degraded' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new citizen or student profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User registered, session token issued' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user with username and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/scenarios': {
      get: {
        summary: 'List active educational scenarios catalog',
        responses: {
          '200': { description: 'Array of scenarios' },
        },
      },
    },
    '/scenarios/{id}': {
      get: {
        summary: 'Retrieve detailed scenario metadata and simulation assets',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Scenario details' },
          '404': { description: 'Scenario not found' },
        },
      },
    },
    '/simulations': {
      post: {
        summary: 'Start authoritative server-side simulation session with timer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['scenarioId'],
                properties: {
                  scenarioId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Simulation session created with authoritative timer' },
        },
      },
    },
    '/simulations/{id}/actions': {
      post: {
        summary: 'Submit user decision in active simulation',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['actionId'],
                properties: {
                  actionId: { type: 'string' },
                  reactionTimeSeconds: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Consequences, simulated loss and educational golden rule' },
        },
      },
    },
    '/certificates/{id}/verify': {
      get: {
        summary: 'Public verification of qualification certificate by ID or SHA-256 hash',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Certificate verified' },
          '404': { description: 'Certificate invalid or not found' },
        },
      },
    },
    '/reports': {
      post: {
        summary: 'Submit fraud report (citizen threat reporting)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['description'],
                properties: {
                  phoneNumber: { type: 'string' },
                  telegramAccount: { type: 'string' },
                  url: { type: 'string' },
                  bankCard: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Report logged for intelligence clustering' },
        },
      },
    },
  },
};
