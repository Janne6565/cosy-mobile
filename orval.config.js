/** @type {import('orval').Config} */
module.exports = {
  'backend-api': {
    input: './openapi-backend.json',
    output: {
      client: 'react-query',
      target: './src/api/generated/backend-api.ts',
      schemas: './src/api/generated/model',
      override: {
        mutator: {
          path: './src/api/customInstance.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
