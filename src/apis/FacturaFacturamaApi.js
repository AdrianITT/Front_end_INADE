import axios from "axios";
import { Api_Host } from "./api";


const factura_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/factura-data/'
})

export const createFacturaFacturama=(data)=> factura_Api.post('/', data);


const facturafacturama_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/facturafacturama/'
})

export const getAllfacturafacturama = async () => facturafacturama_Api.get('/');

export const getfacturafacturamaById = async (id) => facturafacturama_Api.get(`/${id}/`);