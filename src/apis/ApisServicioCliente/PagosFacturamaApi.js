import { Api_Host } from "../api";

// API para obtener datos del complemento de pago
export const getAllFacturaPagosFacturama = async (id) => Api_Host.get(`/complemento-pago/${id}/`);

// API para obtener el PDF del complemento de pago
export const getAllFacturaPagosPDF = (id) => Api_Host.get(`/complemento-pdf/${id}/`);
