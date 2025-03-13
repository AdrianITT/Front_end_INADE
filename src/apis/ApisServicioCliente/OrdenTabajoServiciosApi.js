import { Api_Host } from "../api";

export const getAllOrdenesTrabajoServicio = () => Api_Host.get('/ordentrabajoservicio/');
export const createOrdenTrabajoServico = (data) => Api_Host.post('/ordentrabajoservicio/', data);
export const getOrdenTrabajoServiciosByOrden = (id) => Api_Host.get(`/ordentrabajoservicio/${id}/`);
