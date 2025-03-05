import { Api_Host } from "./api";

export const getAllServicio = () => Api_Host.get('/servicio/');

export const deleteServicio = (id) => Api_Host.delete(`/servicio/${id}/`);

export const createServicio = async (data) => {
    try {
        const response = await Api_Host.post('/servicio/', data);
        return response.data;
    } catch (error) {
        console.error("Error al crear servicio:", error.response?.data || error.message);
        throw error;
    }
};

export const updateServicio = async (id, data) => {
    try {
        const response = await Api_Host.put(`/servicio/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar servicio:", error.response?.data || error.message);
        throw error;
    }
};

export const getServicioById = async (id) => Api_Host.get(`/servicio/${id}/`);
