import { Api_Host } from "../api";

export const getPreguntas = (token) => Api_Host.get(`/surveys/evaluacionescliente/${token}`);

export const puntRespuestas = (token, respuestas) => Api_Host.post(`/surveys/evaluacionescliente/${token}/responder/`, respuestas);

export const getEncuestas = (
  organizacion,
  params = {}
) => {
  return Api_Host.get(
    `/surveys/evaluaciones/organizacion/${organizacion}/`,
    {
      params,
    }
  );
};

export const exportarPDF = (token) => {
  return Api_Host.post(`evaluacionescliente/${token}/crear_respuestas/`,{
    responseType: "blob",
  });
};

export const exportPdfMasivo = (payload) => {
  return Api_Host.post(`/surveys/exportar_pdfs_masivos/`, payload, {
    responseType: "blob",
  });
}
