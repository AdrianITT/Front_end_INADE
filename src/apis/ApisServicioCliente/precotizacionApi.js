import { Api_Host } from "../api";

// Obtener todas las precotizaciones
export const getAllPrecotizacion = () => Api_Host.get('/precotizacion/');

// Actualizar una precotización
export const updatePrecotizacion = async (id, data) => Api_Host.patch(`/precotizacion/${id}/`, data);

// Obtener una precotización por ID
export const getPreCotizacionById = async (id) => Api_Host.get(`/precotizacion/${id}/`);

// Crear una nueva precotización
export const createPreCotizacion = async (data) => {
  try {
    const response = await Api_Host.post('/precotizacion/', data);
    return response;
  } catch (error) {
    console.error("❌ Error en createPreCotizacion:", error);
    if (error.response) {
      console.log("🔍 Detalles del error:", error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw new Error("Error en la solicitud. No se recibió respuesta del servidor.");
    }
  }
};

// Eliminar una precotización
export const deletePrecotizar = (id) => Api_Host.delete(`/precotizacion/${id}/`);

// Obtener todas las precotizaciones por organización
export const getAllPrecotizacionByOrganizacion = async (id) => Api_Host.get(`/allprecotizaciondata/${id}/`);
// Obtener todos los datos de una precotización
export const getAllDataPrecotizacion = async (id) => Api_Host.get(`/detalleprecotizaciondata/${id}`);
