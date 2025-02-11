import axios from "axios";
import { Api_Host } from "./api";


const Factura_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/factura/'
})

export const getAllFactura=()=> Factura_Api.get('/');

export const createFactura=(data)=> Factura_Api.post('/', data);

export const deleteFactura =(id)=>Factura_Api.delete(`/${id}/`);

export const updateFactura = async (id, data) => Factura_Api.put(`/${id}/`,data)

export const getFacturaById = async (id) => Factura_Api.get(`/${id}/`);


