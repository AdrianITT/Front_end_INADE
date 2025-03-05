import axios from "axios";

export const Api_Host = axios.create({
  baseURL: 'http://127.0.0.1:8000/api'
});

// Interceptor para agregar el token a cada solicitud
Api_Host.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
