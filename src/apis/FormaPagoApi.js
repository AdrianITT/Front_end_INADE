import axios from "axios";
import { Api_Host } from "./api";


const FormaPago_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/formapago/'
})

export const getAllFormaPago=()=> FormaPago_Api.get('/');

export const createFormaPago=(data)=> FormaPago_Api.post('/', data);

export const deleteFormaPago =(id)=>FormaPago_Api.delete(`/${id}/`);

export const updateFormaPago = async (id, data) => FormaPago_Api.put(`/${id}/`,data)

export const getFormaPagoaById = async (id) => FormaPago_Api.get(`/${id}/`);