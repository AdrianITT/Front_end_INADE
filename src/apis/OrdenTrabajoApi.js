import { Api_Host } from "./api";

export const getAllOrdenesTrabajo = () => Api_Host.get('/ordentrabajo/');
export const createOrdenTrabajo = (data) => Api_Host.post('/ordentrabajo/', data);
export const getOrdenTrabajoById = (id) => Api_Host.get(`/ordentrabajo/${id}/`);
export const PDFOrdenTrabajo = (id) => Api_Host.get(`/ordentrabajo/${id}/pdf`);
export const deleteOrdenTrabajo = (id) => Api_Host.delete(`/ordentrabajo/${id}/`);
