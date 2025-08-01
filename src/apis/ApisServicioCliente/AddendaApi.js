import { Api_Host } from "../api";

export const createAddenda= (data) => Api_Host.post('/addenda/', data);

export const updateAddenda= (factura_id, data) => Api_Host.patch(`/addenda/${factura_id}/`, data);

export const getAddendaByAddenda=(id)=> Api_Host.get(`/addenda/${id}/`);

export const getAddendaByFactura =(id)=> Api_Host.get(`/datos_addenda_albaran/${id}`);