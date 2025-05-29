import { Api_Host } from "../api";

export const ContadoPrecotizaciones=(organizacion_id)=>Api_Host.get(`contadorprecotizacion/${organizacion_id}/`);