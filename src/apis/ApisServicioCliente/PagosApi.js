import { Api_Host } from "../api";

export const getAllComprobantepago = () => Api_Host.get('/comprobantepago/');

export const createComprobantepago = (data) => Api_Host.post('/comprobantepago/', data);

export const deleteComprobantepago = (id) => Api_Host.delete(`/comprobantepago/${id}/`);

export const DeleteComprobantePagoFacturama = (id) => Api_Host.get(`/comprobante-delete/${id}/`);

export const dataComprobantePago = (id) => Api_Host.get(`/facturaCliente/${id}/`);
export const dataComprobantePagoFactura = (id) => Api_Host.get(`/clienteFactura/${id}/`);

export const getComprobantepagoById = async (id) => Api_Host.get(`/allcomprobantepagodata/${id}/`);
