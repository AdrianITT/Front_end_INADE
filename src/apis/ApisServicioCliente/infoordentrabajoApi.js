import { Api_Host } from "../api";

export const getAllInfoOrdenTrabajo = () => Api_Host.get('/infoordentrabajo/');

export const updateInfoOrdenTrabajo = (id, data) => Api_Host.put(`/infoordentrabajo/${id}/`, data);

export const getInfoOrdenTrabajoById = (id) => Api_Host.get(`/infoordentrabajo/${id}/`);

export const crearInfoOrdenTrabajo = (data) => Api_Host.post('/infoordentrabajo/', data);
