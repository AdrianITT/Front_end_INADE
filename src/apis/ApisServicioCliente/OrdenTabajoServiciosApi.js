import { Api_Host } from "../api";

export const getAllOrdenesTrabajoServicio = () => Api_Host.get('/ordentrabajoservicio/');
export const createOrdenTrabajoServico = (data) => Api_Host.post('/ordentrabajoservicio/', data);
export const getOrdenTrabajoServiciosByOrden = (id) => Api_Host.get(`/ordentrabajoservicio/${id}/`);

export const deleteOrdenTrabajoServicio = (id) => Api_Host.delete(`/ordentrabajoservicio/${id}/`);
export const updateOrdenTrabajoServicio = (id, data) => Api_Host.patch(`/ordentrabajoservicio/${id}/`,data);
