import { Api_Host } from "../api";

export const getAllIva = () => Api_Host.get('/iva/');

export const getIvaById = async (id) => Api_Host.get(`/iva/${id}/`);
