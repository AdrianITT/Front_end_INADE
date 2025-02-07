import axios from "axios";
import { Api_Host } from "./api";

const Usocfdi_Api= axios.create({
        baseURL: Api_Host.defaults.baseURL+'/usocfdi/',
    });

export const getAllUsoCDFI =()=>Usocfdi_Api.get('/');