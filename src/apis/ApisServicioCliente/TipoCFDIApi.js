import { Api_Host } from "../api";

// Obtener todos los tipos de CFDI
export const getAllTipoCDFI = () => Api_Host.get('/tipocfdi/');
