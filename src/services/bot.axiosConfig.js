import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://141.98.153.217:16005',
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use((config) => {
  const login = "KFChicken";
  const password = "PqaW0xEm7M3Ni82ZT3h";
  
  // Create base64 encoded string for basic auth
  const base64Credentials = btoa(`${login}:${password}`);
  
  config.headers['Authorization'] = `Basic ${base64Credentials}`;
  config.headers['x-user-website'] = localStorage.getItem('username');
  
  return config;
});

export default axiosInstance;