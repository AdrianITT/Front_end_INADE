import axios from "axios";
import { Api_Host } from "./api";


const facturafacturama_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/facturafacturama/'
})

export const createFacturaFacturama=(data)=> facturafacturama_Api.post('/', data);

export const getfacturafacturamaById = async (id) => facturafacturama_Api.get(`/${id}/`);