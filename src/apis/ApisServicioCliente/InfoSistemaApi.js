import { Api_Host } from "../api";

export const getInfoSistema = () => Api_Host.get('/infosistema/');

export const createInfoSistema = (data) => Api_Host.post('/infosistema/', data);

export const updateInfoSistema = (id, data) => Api_Host.put(`/infosistema/${id}/`, data);
export const updateInfoSistemapatch = (id, data) => Api_Host.patch(`/infosistema/${id}/`, data);

export const getInfoSistemaById = async (id) => Api_Host.get(`/infosistema/${id}/`);
