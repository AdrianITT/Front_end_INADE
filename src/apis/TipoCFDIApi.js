import axios from "axios";
import { Api_Host } from "./api";


const TipoCDFI_Api= axios.create({
     baseURL: Api_Host.defaults.baseURL+'/tipocfdi/'
})

export const getAllTipoCDFI=()=>TipoCDFI_Api.get('/');
