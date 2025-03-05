import { Api_Host } from "./api";

export const getAllUsoCDFI = () => Api_Host.get('/usocfdi/');
export const createUsoCFDI = (data) => Api_Host.post('/usocfdi/', data);
export const deleteUsoCFDI = (id) => Api_Host.delete(`/usocfdi/${id}/`);
export const updateUsoCFDI = (id, data) => Api_Host.put(`/usocfdi/${id}/`, data);
export const getUsoCFDIById = (id) => Api_Host.get(`/usocfdi/${id}/`);
