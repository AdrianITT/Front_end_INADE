import axios from "axios";
import { Api_Host } from "../api";

const marcaDeAgua_Api = axios.create({
  baseURL: Api_Host.defaults.baseURL + '/imagenmarcaagua/',
});

// Middleware para agregar el token al header en cada solicitud
marcaDeAgua_Api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const updateMarcaAgua = (id, data) => marcaDeAgua_Api.put(`${id}/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const createMarcaAgua = (data) => marcaDeAgua_Api.post('/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
