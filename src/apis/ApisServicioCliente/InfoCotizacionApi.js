import { Api_Host } from "../api";

export const getAllInfoCotizacion = () => Api_Host.get('/infocotizacion/');

export const updateInfoCotizacion = (id, data) => Api_Host.put(`/infocotizacion/${id}/`, data);

export const crearInfoCotizacion = (data) => Api_Host.post('/infocotizacion/', data);

export const getInfoCotizacionById = (id) => Api_Host.get(`/infocotizacion/${id}/`);
