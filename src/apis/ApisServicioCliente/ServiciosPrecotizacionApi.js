import { Api_Host } from "../api";

export const getAllServicioPrecotizacion = () => Api_Host.get('/precotizacionservicio/');

export const getServicioPreCotizacionById = async (id) => Api_Host.get(`/precotizacionservicio/${id}/`);

export const createServicioPreCotizacion = (data) => Api_Host.post('/precotizacionservicio/', data);
