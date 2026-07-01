import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = 'https://foodbridge-43uu.onrender.com'; // ← put YOUR Render URL here

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
});

export default API;