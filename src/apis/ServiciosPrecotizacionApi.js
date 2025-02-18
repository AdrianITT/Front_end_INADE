import axios from "axios";
import { Api_Host } from "./api";

const servicioprecotizacion_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/precotizacionservicio/'
})

export const getAllServicioPrecotizacion=()=>servicioprecotizacion_Api.get('/');
export const getServicioPreCotizacionById = async (id) => servicioprecotizacion_Api.get(`/${id}/`);

export const createServicioPreCotizacion=(data)=> servicioprecotizacion_Api.post('/', data);