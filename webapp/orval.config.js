module.exports = {
    supportTickets: {
      input: {
        target: 'http://localhost:3000/api-json',
      },
      output: {
        mode: 'single',
        target: 'src/api/supportTickets.ts',
        schemas: 'src/types/model',
        client: 'react-query',
      },
    },
  };