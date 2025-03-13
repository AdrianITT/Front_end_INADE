import { Api_Host } from "../api";

export const getAllComprobantepagoFactura = () => Api_Host.get('/comprobantepagofactura/');

export const createComprobantepagoFactura = (data) => Api_Host.post('/comprobantepagofactura/', data);

export const getComprobantepagoFacturaByFactura = (id) => Api_Host.get(`/comprobantepagofactura/${id}/`);
