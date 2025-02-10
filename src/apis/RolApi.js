import axios from "axios";
import { Api_Host } from "./api";


const Rol_Api= axios.create({
        baseURL: Api_Host.defaults.baseURL+'/rol/'
    })

export const getAllRol=()=>Rol_Api.get('/');