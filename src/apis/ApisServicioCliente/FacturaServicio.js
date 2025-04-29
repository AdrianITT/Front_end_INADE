//facturaservicio/
import { Api_Host } from "../api";

export const createServicioFactura = (data) => Api_Host.post('/facturaservicio/', data);