import { Api_Host } from "../api";
export const getReceptores = (organizacionId) => Api_Host.get(`/allreceptoresdata/${organizacionId}/`);
export const getUsuariosAsignables = (organizacionId) => Api_Host.get(`/users/assignables/${organizacionId}/`);
// async getUsuariosAsignables(organizacionId) {
//     const r = await Api_Host.get(`/users/assignables/${organizacionId}/`, {
//       withCredentials: true, // si usas sesión por cookies
//     });
//     if (r.status !== 200 || !Array.isArray(r.data)) {
//       throw new Error("Respuesta inesperada del servidor");
//     }
//     return r.data; // <- es un array
//   },
export const ReceptoresAPI = {
  async getReceptores(organizacionId) {
    const r = await fetch(`${Api_Host}/allreceptoresdata/${organizacionId}/`);
    if (!r.ok) throw new Error("No se pudo cargar receptores");
    return r.json();
  },

  async createReceptor(payload) {
    try{
      const r = await Api_Host.post('/receptor/',payload, {
        headers: { "Content-Type": "application/json" },
      });
      return r.data;

    }catch (error) {
      throw new Error("No se pudo crear el receptor");
    }
  },

  async updateReceptor(id, payload) {
    try {
      const r = await Api_Host.patch(`/receptor/${id}/`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      return r.data; // Axios devuelve la respuesta en r.data
    } catch (error) {
      throw new Error("No se pudo actualizar el receptor");
    }
  },

  async deleteReceptor(id) {
    try{
      const r = await Api_Host.delete(`/receptor/${id}/`);
      return r.data; // Axios devuelve la respuesta en r.data

    }catch (error) {
      throw new Error("No se pudo eliminar el receptor");
    }
  },

 async getUsuariosAsignables(organizacionId) {
    const r = await Api_Host.get(`/users/assignables/${organizacionId}/`, {
      withCredentials: true, // si usas sesión por cookies
    });
    if (r.status !== 200 || !Array.isArray(r.data)) {
      throw new Error("Respuesta inesperada del servidor");
    }
    return r.data; // <- es un array
  },


  async updateReceptordata(id, payload) {
    const r = await fetch(`${Api_Host}/receptor/${id}/`, {
      method: "PATCH", // o PATCH si tu API lo usa
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("No se pudo actualizar el receptor");
    return r.json();
  },

  async relateUserToReceptor(receptorId, userId) {
    const { data } = await Api_Host.patch(`/receptor/${receptorId}/`, { user: userId });
    return data;
  },
};