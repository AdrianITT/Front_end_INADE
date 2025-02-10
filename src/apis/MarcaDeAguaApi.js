import axios from "axios";
import { Api_Host } from "./api";



const marcaDeAgua_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/imagenmarcaagua/',
});

export const updateMarcaAgua = (id, data) => marcaDeAgua_Api.put(`${id}/`, data, {
     headers: { 'Content-Type': 'multipart/form-data' }
 });
 
 export const createMaraAgua = (data) => marcaDeAgua_Api.post('/', data, {
     headers: { 'Content-Type': 'multipart/form-data' }
 });