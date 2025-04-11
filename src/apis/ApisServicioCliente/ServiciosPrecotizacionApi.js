import { Api_Host } from "../api";

export const getAllServicioPrecotizacion = () => Api_Host.get('/precotizacionservicio/');

export const getServicioPreCotizacionById = async (id) => Api_Host.get(`/precotizacionservicio/${id}/`);

export const createServicioPreCotizacion = (data) => Api_Host.post('/precotizacionservicio/', data);

export const deleteServicioPreCotizacionById = async (id) => Api_Host.delete(`/precotizacionservicio/${id}/`);

export const updateServicioPreCotizacionById = async (id, data) => Api_Host.patch(`/precotizacionservicio/${id}/`, data);
