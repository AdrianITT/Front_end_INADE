import axios from "axios";
import { Api_Host } from "./api";


const Comprobantepago_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/comprobantepago/'
})

export const getAllComprobantepago=()=> Comprobantepago_Api.get('/');

export const createComprobantepago=(data)=> Comprobantepago_Api.post('/', data);

export const deleteComprobantepago =(id)=>Comprobantepago_Api.delete(`/${id}/`);

//export const deleteCliente =(id)=>Cliente_Api.delete(`/${id}/`);

//export const updateCliente = async (id, data) => Cliente_Api.put(`/${id}/`,data)

//export const getClienteById = async (id) => Cliente_Api.get(`/${id}/`);