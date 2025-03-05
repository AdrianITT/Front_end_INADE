import { Api_Host } from "./api";

export const getAllOrganizacion = () => Api_Host.get('/organizacion/');

export const updateOrganizacion = async (id, data) => {
  try {
    console.log(`🚀 Enviando actualización de organización ID: ${id}`);
    console.log("📌 Datos enviados:", data);

    const response = await Api_Host.put(`/organizacion/${id}/`, data);

    console.log("✅ Respuesta de la API:", response.data);
    return response.data; // Devolvemos la respuesta en caso de necesitarla en el frontend.
  } catch (error) {
    console.error("❌ Error al actualizar la organización:", error);

    if (error.response) {
      console.error("⚠ Respuesta del servidor:", error.response.data);
      throw new Error(`Error en la API: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("⚠ No hubo respuesta del servidor:", error.request);
      throw new Error("No hubo respuesta del servidor. Verifica la conexión.");
    } else {
      console.error("⚠ Error desconocido:", error.message);
      throw new Error(`Error desconocido: ${error.message}`);
    }
  }
};

export const getOrganizacionById = async (id) => Api_Host.get(`/organizacion/${id}/`);
