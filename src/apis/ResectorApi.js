import { Api_Host } from "./api";

// Obtener todos los receptores
export const getAllReceptor = () => Api_Host.get('/receptor/');

// Actualizar un receptor
export const updateReceptor = (id, data) => Api_Host.put(`/receptor/${id}/`, data);

// Crear un receptor
export const createReceptor = async (data) => {
  try {
    const response = await Api_Host.post('/receptor/', data);
    return response.data;
  } catch (error) {
    console.error("Error al crear receptor:", error);
    throw error;
  }
};

// Obtener receptor por ID
export const getReceptorById = async (id) => Api_Host.get(`/receptor/${id}/`);
