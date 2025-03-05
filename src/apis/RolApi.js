import { Api_Host } from "./api";

// Obtener todos los roles
export const getAllRol = () => Api_Host.get('/rol/');
