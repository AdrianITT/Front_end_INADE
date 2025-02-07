import axios from "axios";
import { Api_Host } from "./api";

const InfoSistema_Api= axios.create({
        baseURL: Api_Host.defaults.baseURL+'/infosistema/'
    })

export const getInfoSistema=()=>InfoSistema_Api.get('/');