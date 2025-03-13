import { Api_Host } from "../api";

// Usar Api_Host en lugar de crear nuevas instancias de axios
export const createFacturaFacturama = (data) => Api_Host.post('/factura-data/', data);

export const getAllfacturafacturama = async () => Api_Host.get('/facturafacturama/');

export const getfacturafacturamaById = async (id) => Api_Host.get(`/facturafacturama/${id}/`);