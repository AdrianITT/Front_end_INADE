import axios from "axios";
import { Api_Host } from "./api";


const InfoCotizacion_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/infocotizacion/'
})

export const getAllInfoCotizacion=()=>InfoCotizacion_Api.get('/');

export const updateInfoCotizacion=(id,data)=>InfoCotizacion_Api.put(`/${id}/`,data);

export const crearInfoCotizacion =(data)=>InfoCotizacion_Api.post( data);

export const getInfoCotizacionById=(id)=>InfoCotizacion_Api.get(`/${id}/`);