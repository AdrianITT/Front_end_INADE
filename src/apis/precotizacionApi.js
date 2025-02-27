import axios from "axios";
import { Api_Host } from "./api";

const precotizacion_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/precotizacion/'
})

export const getAllPrecotizacion=()=>precotizacion_Api.get('/');

export const updatePrecotizacion = async (id, data) => precotizacion_Api.put(`/${id}/`,data)

export const getPreCotizacionById = async (id) => precotizacion_Api.get(`/${id}/`);

export const createPreCotizacion = async (data) => {
     try {
       const response = await precotizacion_Api.post("/", data);
       return response; // Devuelve la respuesta si es exitosa
     } catch (error) {
       console.error("❌ Error en createPreCotizacion:", error);
   
       if (error.response) {
         console.log("🔍 Detalles del error:", error.response.data);
         throw new Error(JSON.stringify(error.response.data)); // Lanza un error con los detalles de la API
       } else {
         throw new Error("Error en la solicitud. No se recibió respuesta del servidor.");
       }
     }
   };

   export const deletePrecotizar =(id)=>precotizacion_Api.delete(`/${id}/`);