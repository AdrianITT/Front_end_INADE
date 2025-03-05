import { Api_Host } from "./api";

// Obtener todas las unidades CFDI
export const getAllUnidadCDFI = () => Api_Host.get('/unidadcfdi/');
