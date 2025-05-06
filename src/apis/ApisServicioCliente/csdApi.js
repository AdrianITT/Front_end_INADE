import { Api_Host } from "../api";

export const getAllCSD = () => Api_Host.get('/certificadosellodigital/');

export const createCSD = (data) => Api_Host.post('/certificadosellodigital/', data);

export const deleteCSD = (id) => Api_Host.delete(`/certificadosellodigital/${id}/`);

export const getAllCsdData = (id) => Api_Host.get(`/obtener_csd/${id}/`);

export const updateCSD = async (id, data) => {
    try {
        const response = await Api_Host.put(`/certificadosellodigital/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar CSD:", error.response?.data || error.message);
        throw error;
    }
};

export const getCSDById = async (id) => Api_Host.get(`/certificadosellodigital/${id}/`);

// Cargar CSD desde otro endpoint
export const FacturamaCSD = async (id) => {
    try {
        const response = await Api_Host.get(`/carga-csd/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Error al cargar CSD:", error.response?.data || error.message);
        throw error;
    }
};
