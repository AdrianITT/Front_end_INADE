import { Api_Host } from "../api";

export const getAllFacturaPagos = (id) => Api_Host.get(`/factura/${id}/pagos`);
