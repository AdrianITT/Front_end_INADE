import axios from "axios";
import { Api_Host } from "./api";


const ComprobantepagoFactura_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/comprobantepagofactura/'
})

export const getAllComprobantepagoFactura=()=> ComprobantepagoFactura_Api.get('/');

export const createComprobantepagoFactura=(data)=> ComprobantepagoFactura_Api.post('/', data);
export const getComprobantepagoFacturaByFactura=(id)=>ComprobantepagoFactura_Api.get(`/${id}/`);