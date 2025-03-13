import { Api_Host } from "../api";

export const getAllCotizacionServicio = () => Api_Host.get('/cotizacionservicio/');
export const createCotizacionServicio = (data) => Api_Host.post('/cotizacionservicio/', data);
export const getCotizacionServiciosByCotizacion = (data) => Api_Host.get('/cotizacionservicio/', data);

export const updateCotizacionServicio = async (id, data) => {
  try {
    const response = await Api_Host.put(`/cotizacionservicio/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error en updateCotizacionServicio:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteCotizacionServicio = (id) => Api_Host.delete(`/cotizacionservicio/${id}/`);
