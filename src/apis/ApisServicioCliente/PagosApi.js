import { Api_Host } from "../api";

export const getAllComprobantepago = () => Api_Host.get('/comprobantepago/');

export const createComprobantepago = (data) => Api_Host.post('/comprobantepago/', data);

export const deleteComprobantepago = (id) => Api_Host.delete(`/comprobantepago/${id}/`);

export const DeleteComprobantePagoFacturama = (id) => Api_Host.get(`/comprobante-delete/${id}/`);
