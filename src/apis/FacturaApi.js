import axios from "axios";
import { Api_Host } from "./api";


const Factura_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/factura/'
})

export const getAllFactura=()=> Factura_Api.get('/');

export const createFactura=(data)=> Factura_Api.post('/', data);

export const deleteFactura =(id)=>Factura_Api.delete(`/${id}/`);

export const updateFactura = async (id, data) => Factura_Api.put(`/${id}/`,data)

export const getFacturaById = async (id) => Factura_Api.get(`/${id}/`);


//new
const FacturaPDF_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/factura-data/'
})

export const createPDFfactura = async (id) => {
     try {
       const response = await FacturaPDF_Api.get(`/${id}/`);
       console.log("✅ PDF generado con éxito:", response);
       console.log("✅ PDF generado con éxito:", response.data);
       return response.data; // Devuelve los datos si la solicitud fue exitosa
     } catch (error) {
       if (error.response) {
         // El servidor respondió con un código de estado diferente de 2xx
         console.error("❌ Error en la respuesta de la API:", error.response.status);
         console.error("📄 Detalles del error:", error.response.data);
       } else if (error.request) {
         // La solicitud fue hecha pero no hubo respuesta
         console.error("⚠️ No hubo respuesta del servidor:", error.request);
       } else {
         // Algo sucedió al configurar la solicitud
         console.error("🔍 Error en la configuración de la solicitud:", error.message);
       }
       throw error; // Relanza el error para manejarlo en el componente que lo llama
     }
   };

   const FacturaPDFdescarga_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/factura-pdf/'
});

export const getFacturPDFaById = async (id) => FacturaPDFdescarga_Api.get(`/${id}/`);

