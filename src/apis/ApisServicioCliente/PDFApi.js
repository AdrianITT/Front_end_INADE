import { Api_Host } from "../api";

// API para obtener el PDF de la cotización
export const PDFCotizacion = async (id) => {
  try {
    const response = await Api_Host.get(`/cotizacion/${id}/pdf`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el PDF de la cotización:", error);
    throw error;
  }
};
