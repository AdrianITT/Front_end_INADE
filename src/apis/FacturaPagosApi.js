import axios from "axios";
import { Api_Host } from "./api";


const FacturaPagos_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/factura/'
})

export const getAllFacturaPagos = (id) => FacturaPagos_Api.get(`/${id}/pagos`);

