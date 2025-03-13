import { Api_Host } from "../api";

export const getAllEmpresas = () => Api_Host.get('/empresa/');
export const createEmpresas = (data) => Api_Host.post('/empresa/', data);
export const deleteEmpresa = (id) => Api_Host.delete(`/empresa/${id}/`);
export const updateEmpresa = (id, data) => Api_Host.put(`/empresa/${id}/`, data);
export const getEmpresaById = (id) => Api_Host.get(`/empresa/${id}/`);
