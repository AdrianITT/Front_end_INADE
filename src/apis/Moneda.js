import { Api_Host } from "./api";

export const getAllTipoMoneda = () => Api_Host.get('/tipomoneda/');
export const getTipoMonedaById = (id) => Api_Host.get(`/tipomoneda/${id}/`);
