import { Api_Host } from "../../api";
// cotizaciones_detalle_Ad
export const getCotizacionesDetalleAd=(id)=> Api_Host.get(`/cotizaciones_detalle_Ad/?org_id=${id}`);
