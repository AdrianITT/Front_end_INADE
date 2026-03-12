import { Api_Host } from "../api";

export const getAllRegimenFiscal = () => Api_Host.get('/regimenfiscal/');
export const createRegimenFiscal = (data) => Api_Host.post('/regimenfiscal/', data);
