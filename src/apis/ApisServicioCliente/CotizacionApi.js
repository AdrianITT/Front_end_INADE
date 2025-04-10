import { Api_Host } from "../api";

export const getAllCotizacion = () => Api_Host.get('/cotizacion/');

export const updateCotizacion = (id, data) => Api_Host.patch(`/cotizacion/${id}/`, data);

export const createCotizacion = (data) => Api_Host.post('/cotizacion/', data);

export const getCotizacionById = async (id) => Api_Host.get(`/cotizacion/${id}/`);

export const getAllcotizacionesdata = async (id) => Api_Host.get(`/allcotizacionesdata/${id}/`);//`//${id}/`
export const getDetallecotizaciondataById = async (id) => Api_Host.get(`/detallecotizaciondata/${id}/`);
