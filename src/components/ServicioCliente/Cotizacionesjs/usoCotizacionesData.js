import { useState, useEffect } from "react";
import { getAllcotizacionesdata} from "../../../apis/ApisServicioCliente/CotizacionApi";

export const useCotizacionesData = (organizationId) => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getAllcotizacionesdata(organizationId);
        //console.log("Cotizaciones response:", response);
        const cotizacionesValidadas = (response.data || [])
        .map((c) => {
          const clienteIncompleto = !c["Correo"] || !c["CodigoPostal"];
          const empresaIncompleta = !c["CalleEmpresa"] || !c["rfcEmpresa"];
          return {
            ...c,
            incompleto: clienteIncompleto || empresaIncompleta,
          };
        })
        .sort((a, b) => {
          // Incompletos primero
          if (a.incompleto && !b.incompleto) return -1;
          if (!a.incompleto && b.incompleto) return 1;

          // Si ambos son completos o incompletos, ordenar por ID
          const idA = parseInt(a["Cotización"]);
          const idB = parseInt(b["Cotización"]);
          return idA - idB;
        });


        setCotizaciones(cotizacionesValidadas);
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
