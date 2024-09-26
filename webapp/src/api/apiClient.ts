import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'x-api-key': 'super-secret-api-key',
  },
});

export default apiClient;