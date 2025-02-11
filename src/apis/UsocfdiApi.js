import axios from "axios";
import { Api_Host } from "./api";

const Usocfdi_Api= axios.create({
        baseURL: Api_Host.defaults.baseURL+'/usocfdi/',
    });

export const getAllUsoCDFI =()=>Usocfdi_Api.get('/');
export const createUsoCFDI=(data)=> Usocfdi_Api.post('/', data);

export const deleteUsoCFDI =(id)=>Usocfdi_Api.delete(`/${id}/`);

export const updateUsoCFDI = async (id, data) => Usocfdi_Api.put(`/${id}/`,data)

export const getUsoCFDIById = async (id) => Usocfdi_Api.get(`/${id}/`);