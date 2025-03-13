import { Api_Host } from "../api";

// Obtener todos los títulos
export const getAllTitulo = () => Api_Host.get('/titulo/');
