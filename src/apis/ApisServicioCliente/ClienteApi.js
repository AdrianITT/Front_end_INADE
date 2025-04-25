import { Api_Host } from "../api";

export const getAllCliente = () => Api_Host.get('/cliente/');
export const getAllClienteData = (id) => Api_Host.get(`/allClientesData/${id}/`);
export const createCliente = (data) => Api_Host.post('/cliente/', data);
export const deleteCliente = (id) => Api_Host.delete(`/cliente/${id}/`);
export const updateCliente = (id, data) => Api_Host.put(`/cliente/${id}/`, data);
export const getClienteById = (id) => Api_Host.get(`/cliente/${id}/`);
export const getClienteDataById = (id) => Api_Host.get(`/direccionclienteempresa/${id}/`);
