import { Api_Host } from "./api";

// Obtener todos los usuarios
export const getAllUser = () => Api_Host.get("/user/");

// Obtener un usuario por ID
export const getUserById = (id) => Api_Host.get(`/user/${id}/`);

// Actualizar un usuario (usando PATCH)
export const updateUser = (id, data) => Api_Host.patch(`/user/${id}/`, data);

// Crear un nuevo usuario
export const createUser = (data) => Api_Host.post("/user/", data);

// Eliminar un usuario
export const deleteUser = (id) => Api_Host.delete(`/user/${id}/`);
 