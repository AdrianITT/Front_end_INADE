import axios from "axios";
import { Api_Host } from "./api";

const InfoSistema_Api= axios.create({
        baseURL: Api_Host.defaults.baseURL+'/infosistema/'
    })

export const getInfoSistema=()=>InfoSistema_Api.get('/');

export const createInfoSistema=(data)=>InfoSistema_Api.post('/',data);

export const updateInfoSistema=(id,data)=>InfoSistema_Api.put(`/${id}/`,data);

export const getInfoSistemaById = async (id) => InfoSistema_Api.get(`/${id}/`);