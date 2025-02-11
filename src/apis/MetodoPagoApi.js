import axios from "axios";
import { Api_Host } from "./api";


const Metodopago_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/metodopago/'
})

export const getAllMetodopago=()=> Metodopago_Api.get('/');

export const createMetodopago=(data)=> Metodopago_Api.post('/', data);

export const deleteMetodopago =(id)=>Metodopago_Api.delete(`/${id}/`);

export const updateMetodopago = async (id, data) => Metodopago_Api.put(`/${id}/`,data)

export const getMetodopagoById = async (id) => Metodopago_Api.get(`/${id}/`);


