import { Api_Host } from "../api";

export const createAlbaran= (data) => Api_Host.post('/albaran/', data);

export const updateAlbaran= (id ,data) => Api_Host.patch(`/albaran/${id}/`, data);

export const getAlbaranByAlbaran=(id)=> Api_Host.get(`/albaran/${id}`);