import { Api_Host } from "../../api";

export const registrarEmpresaYUsuario = async (data) => {
  try {
    const formData = new FormData();

    // --- 1️⃣ Marca de Agua ---
    if (data.marcaAgua?.marcaAgua?.[0]?.originFileObj) {
      formData.append("marcaAgua", data.marcaAgua.marcaAgua[0].originFileObj); // ✅ nombre único
    }

    // --- 2️⃣ Organización ---
    if (data.organizacion?.logo?.[0]?.originFileObj) {
      formData.append("logo_organizacion", data.organizacion.logo[0].originFileObj); // ✅ otro nombre
    }

    // Luego los demás campos normales de la organización:
    for (const [key, value] of Object.entries(data.organizacion || {})) {
      if (key !== "logo") formData.append(key, value ?? "");
    }

    for (const [key, value] of Object.entries(data.usuario || {})) {
      formData.append(key, value ?? "");
    }

    formData.append("configuracion", JSON.stringify(data.infoSistema.configuracion || {}));
    formData.append("cotizacion", JSON.stringify(data.infoSistema.cotizacion || {}));
    formData.append("orden", JSON.stringify(data.infoSistema.orden || {}));

    const response = await Api_Host.post(
      "/registro_wizard/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error en registrarEmpresaYUsuario:", error);
    throw error.response?.data || error;
  }
};
