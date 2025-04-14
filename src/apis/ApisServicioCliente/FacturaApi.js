import { Api_Host } from "../api";

// Factura_Api usa Api_Host, que ya incluye el token en el header
export const getAllFactura = () => Api_Host.get('/factura/');

export const createFactura = (data) => Api_Host.post('/factura/', data);

export const deleteFactura = (id) => Api_Host.delete(`/factura/${id}/`);

export const updateFactura = async (id, data) => Api_Host.put(`/factura/${id}/`, data);

export const getFacturaById = async (id) => Api_Host.get(`/factura/${id}/`);


// Para PDF - FacturaPDF_Api
export const createPDFfactura = async (id) => {
     try {
       const response = await Api_Host.get(`/factura-data/${id}/`);
       console.log("✅ PDF generado con éxito:", response);
       return response.data;
     } catch (error) {
       console.error("❌ Error generando PDF:", error);
       throw error;
     }
};

export const getAllFacturaByOrganozacion = async (id) => Api_Host.get(`/allfacturasdata/${id}/`);

export const getAllDataFactura = async (id) => Api_Host.get(`/detallefacturadata/${id}`);

export const getAllDataFacturaById = async (id) => Api_Host.get(`/dataordentrabajocrearfactura/${id}/`);

// Para descarga del PDF - FacturaPDFdescarga_Api
export const getFacturPDFaById = async (id) => Api_Host.get(`/factura-pdf/${id}/`);
