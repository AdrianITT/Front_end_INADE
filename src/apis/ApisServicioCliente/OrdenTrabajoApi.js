import { Api_Host } from "../api";

export const getAllOrdenesTrabajo = () => Api_Host.get('/ordentrabajo/');
export const createOrdenTrabajo = (data) => Api_Host.post('/ordentrabajo/', data);
export const getOrdenTrabajoById = (id) => Api_Host.get(`/ordentrabajo/${id}/`);
export const PDFOrdenTrabajo = (id) => Api_Host.get(`/ordentrabajo/${id}/pdf`);
export const deleteOrdenTrabajo = (id) => Api_Host.delete(`/ordentrabajo/${id}/`);

export const updateOrdenTrabajo = (id,data) => Api_Host.patch(`/ordentrabajo/${id}/`, data);

export const getAllOrdenesTrabajoData = (id) => Api_Host.get(`/allordentrabajodata/${id}/`);

export const getDetalleOrdenTrabajoDataById = (id) => Api_Host.get(`/dataordentrabajo/${id}/`);
//dataeditordentrabajo
export const EditOrdenTrabajoData = (id) => Api_Host.get(`/dataeditordentrabajo/${id}/`);
