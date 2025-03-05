// src/hooks/useCotizacionesData.js
import { useState, useEffect } from "react";
import { getAllCotizacion } from "../../apis/CotizacionApi";
import { getAllCliente } from "../../apis/ClienteApi";
import { getAllTipoMoneda } from "../../apis/Moneda";
import { getAllEmpresas } from "../../apis/EmpresaApi";
import { getEstadoById } from "../../apis/EstadoApi";

// Helper para crear un diccionario (objeto) a partir de un arreglo
const createDictionary = (data, key) =>
  data.reduce((acc, item) => ({ ...acc, [item[key]]: item }), {});

// Custom hook que obtiene y procesa las cotizaciones según la organización
export const useCotizacionesData = (organizationId) => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función que obtiene los estados para cada cotización y los agrega a la data
  const fetchCotizacionesYEstados = async (cotizaciones, clientes, empresas, monedas) => {
    try {
      const estadosMap = {};
      // Para cada cotización, obtenemos su estado
      await Promise.all(
        cotizaciones.map(async (cot) => {
          try {
            const estadoResp = await getEstadoById(cot.estado);
            estadosMap[cot.estado] = estadoResp.data.nombre;
          } catch (error) {
            console.error(`Error obteniendo estado ${cot.estado}:`, error);
            estadosMap[cot.estado] = "Desconocido";
          }
        })
      );

      // Creamos diccionarios para clientes, empresas y monedas
      const clientesMap = createDictionary(clientes, "id");
      const empresasMap = createDictionary(empresas, "id");
      const monedasMap = createDictionary(monedas, "id");

      // Procesamos cada cotización para agregar detalles adicionales
      const cotizacionesConDetalles = cotizaciones.map((cot) => {
        const cliente = clientesMap[cot.cliente] || {};
        const empresa = empresasMap[cliente.empresa] || {};
        const moneda = monedasMap[cot.tipoMoneda] || {};

        // Determinamos si hay datos incompletos en el cliente o la empresa
        const clienteIncompleto =
          !cliente.nombrePila || !cliente.apPaterno || !cliente.correo ;
        const empresaIncompleta =
          !empresa.nombre || !empresa.rfc || !empresa.calle || !empresa.numero || !empresa.colonia;

        return {
          ...cot,
          empresa: empresa.nombre || "Empresa desconocida",
          contacto: `${cliente.nombrePila || "Sin nombre"} ${cliente.apPaterno || ""} ${cliente.apMaterno || ""}`.trim(),
          moneda: moneda.codigo || "",
          estado: estadosMap[cot.estado] || "Desconocido",
          incompleto: clienteIncompleto || empresaIncompleta,
        };
      });

      // Ordenamos las cotizaciones para que las incompletas aparezcan primero
      const sortedCotizaciones = cotizacionesConDetalles.sort((a, b) => b.incompleto - a.incompleto);
      setCotizaciones(sortedCotizaciones);
    } catch (error) {
      console.error("Error al obtener cotizaciones y detalles:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Ejecutamos todas las llamadas en paralelo
        const [cotizacionesRes, clientesRes, monedasRes, empresasRes] = await Promise.all([
          getAllCotizacion(),
          getAllCliente(),
          getAllTipoMoneda(),
          getAllEmpresas(),
        ]);

        // Filtramos las empresas por organización
        const filteredEmpresas = empresasRes.data.filter(
          (empresa) => empresa.organizacion === organizationId
        );

        // Filtramos los clientes que pertenezcan a esas empresas
        const filteredClientes = clientesRes.data.filter((cliente) =>
          filteredEmpresas.some((empresa) => empresa.id === cliente.empresa)
        );

        // Filtramos las cotizaciones cuyos clientes estén en la lista filtrada
        const filteredCotizaciones = cotizacionesRes.data.filter((cotizacion) =>
          filteredClientes.some((cliente) => cliente.id === cotizacion.cliente)
        );

        // Procesamos las cotizaciones para agregar detalles
        await fetchCotizacionesYEstados(filteredCotizaciones, filteredClientes, filteredEmpresas, monedasRes.data);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  return { cotizaciones, isLoading };
};
