import { Api_Host } from "../api";

// Usar Api_Host para todas las solicitudes
export const getAllFormaPago = () => Api_Host.get('/formapago/');

export const createFormaPago = (data) => Api_Host.post('/formapago/', data);

export const deleteFormaPago = (id) => Api_Host.delete(`/formapago/${id}/`);

export const updateFormaPago = async (id, data) => Api_Host.put(`/formapago/${id}/`, data);

export const getFormaPagoById = async (id) => Api_Host.get(`/formapago/${id}/`);
