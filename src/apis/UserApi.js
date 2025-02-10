import axios from "axios";
import { Api_Host } from "./api";

const User_Api = axios.create({
  baseURL: Api_Host.defaults.baseURL + '/user/'
});

export const getAllUser = () => User_Api.get('/');

export const getUserById = (id) => User_Api.get(`/${id}/`); // <-- Nueva función

export const updateUser = (id, data) => User_Api.put(`/${id}/`, data); // <-- Corregir "punt" a "put"

export const createUser = (data) => User_Api.post('/', data);

export const deleteUser = (id) => User_Api.delete(`/${id}/`);