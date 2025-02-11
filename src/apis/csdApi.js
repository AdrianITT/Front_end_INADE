import axios from "axios";
import { Api_Host } from "./api";


const CSD_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/certificadosellodigital/'
})

export const getAllCSD=()=> CSD_Api.get('/');

export const createCSD=(data)=> CSD_Api.post('/', data);

export const deleteCSD =(id)=>CSD_Api.delete(`/${id}/`);

export const updateCSD = async (id, data) => CSD_Api.put(`/${id}/`,data)

export const getCSDById = async (id) => CSD_Api.get(`/${id}/`);


