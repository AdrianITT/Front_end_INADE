import axios from "axios";
import { Api_Host } from "./api";


const FacturaPagosFacturama_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/complemento-pago/'
})

export const getAllFacturaPagosFacturama = async (id) => FacturaPagosFacturama_Api.get(`/${id}/`);

   const FacturaPagosFacturamaPDF_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/complemento-pdf/'
})
   
export const getAllFacturaPagosPDF = (id) => FacturaPagosFacturamaPDF_Api.get(`/${id}/`);