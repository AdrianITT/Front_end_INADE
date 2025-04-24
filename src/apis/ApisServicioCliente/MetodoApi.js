import { Api_Host } from "../api";

export const getAllMetodo = () => Api_Host.get('/metodos/');

export const createMetodo = async (data) => {
  try {
    const response = await Api_Host.post('/metodos/', data);
    return response.data;
  } catch (error) {
    console.error("Error al crear METODO:", error);
    throw error;
  }
};

export const deleteMetodo = async (id) => {
  try {
    const response = await Api_Host.delete(`/metodos/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar Metodo:", error);
    throw error;
  }
};

export const getMetodoById = (id) => Api_Host.get(`/metodos/${id}/`);

export const getAllMetodoData=(id) => Api_Host.get(`/allMetodosData/${id}/`);
