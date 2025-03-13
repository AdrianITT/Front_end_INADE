import { Api_Host } from "../api";

export const getAllMetodopago = () => Api_Host.get('/metodopago/');
export const createMetodopago = (data) => Api_Host.post('/metodopago/', data);
export const deleteMetodopago = (id) => Api_Host.delete(`/metodopago/${id}/`);
export const updateMetodopago = async (id, data) => {
  try {
    const response = await Api_Host.put(`/metodopago/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error en updateMetodopago:", error.response?.data || error.message);
    throw error;
  }
};
export const getMetodopagoById = async (id) => Api_Host.get(`/metodopago/${id}/`);
