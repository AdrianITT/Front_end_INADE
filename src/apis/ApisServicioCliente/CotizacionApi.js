import { Api_Host } from "../api";

export const getAllCotizacion = () => Api_Host.get('/cotizacion/');

export const updateCotizacion = (id, data) => Api_Host.patch(`/cotizacion/${id}/`, data);

export const createCotizacion = (data) => Api_Host.post('/cotizacion/', data);

export const deleteCotizacion = (id) => Api_Host.delete(`/cotizacion/${id}/`);

export const getCotizacionById = async (id) => Api_Host.get(`/cotizacion/${id}/`);

export const getAllcotizacionesdata = async (id) => Api_Host.get(`/allcotizacionesdata/${id}/`);//`//${id}/`

export const getDetallecotizaciondataById = async (id) => Api_Host.get(`/detallecotizaciondata/${id}/`);

export const getDuplicarCotizacion =(id, idCliente, nombreusuario)=> Api_Host.get(`/duplicarCotizacion/${id}/?cliente=${idCliente}&nombreusuario=${nombreusuario}`);

export const getAllCotizacionByCliente = (id) => Api_Host.get(`/listaClientes/${id}/`);

export const getDataCotizacionBy = (id) => Api_Host.get(`/crearFactura/${id}/`);

export const getIdCotizacionBy = (id) => Api_Host.get(`primera_cotizacion/${id}/`);

// ruta de prueba testCotizacion

// Página 1, 10 por página
export const getpage =(orgId)=>Api_Host.get(`/allcotizacionesdata/${orgId}/`, {
  params: { page: 1, page_size: 10 }
});

// Con búsqueda
export const getBusqueda =(orgId)=>Api_Host.get(`/allcotizacionesdata/${orgId}/`, {
  params: { page: 1, page_size: 10, search: 'kemper' }
});

// Orden por ID descendente
export const getdecendente =(orgId)=>Api_Host.get(`/allcotizacionesdata/${orgId}/`, {
  params: { page: 1, page_size: 10, sort: '-id' }
});

// Orden por "Empresa" ascendente
export const getEmpresa =(orgId)=>Api_Host.get(`/allcotizacionesdata/${orgId}/`, {
  params: { page: 1, page_size: 10, sort: 'Empresa' }
});

// Obtener cotizaciones paginadas (Opción 2 de tu backend)
export const getCotizacionesPaged = (orgId, { page, pageSize, search, sort }, signal) =>
  Api_Host.get(`/alltestcotizacionesdata/${orgId}/`, {
    params: { page, page_size: pageSize, search, sort },
    signal,
  });



  // Cotizacion Filtrados por servicio serviceofcotizacion
  // apis/ApisServicioCliente/CotizacionApi.js
export const getCotizacionesByServicioOrg = (orgId, servicioId, { page, pageSize, search, sort }, signal) =>
  Api_Host.get(`/cotizaciones/por-servicio-org/${orgId}/${servicioId}/`, {
    params: { page, page_size: pageSize, search, sort },
    signal,
  });

