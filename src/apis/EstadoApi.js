import { Api_Host } from "./api";

export const getEstadoById = async (id) => Api_Host.get(`/estado/${id}/`);

export const getAllEstado = async () => Api_Host.get('/estado/');
