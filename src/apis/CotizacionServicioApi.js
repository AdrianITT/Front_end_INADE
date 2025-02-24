import axios from "axios";
import { Api_Host } from "./api";


const CotizacionServicio_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/cotizacionservicio/'
})

export const getAllCotizacionServicio=()=>CotizacionServicio_Api.get('/');

export const createCotizacionServicio=(data)=>CotizacionServicio_Api.post('/',data);

export const getCotizacionServiciosByCotizacion =(data)=>CotizacionServicio_Api.get('/',data)

//export const updateCotizacionServicio=(id, data)=>CotizacionServicio_Api.put(`/${id}/`,data);

export const updateCotizacionServicio = async (id, data) => {
     try {
         const response = await CotizacionServicio_Api.put(`/${id}/`, data);
         return response.data;
     } catch (error) {
         console.error("Error en updateCotizacionServicio:", error.response?.data || error.message);
         throw error;
     }
 };

 export const deleteCotizacionServicio=(id)=>CotizacionServicio_Api.delete(`/${id}/`);