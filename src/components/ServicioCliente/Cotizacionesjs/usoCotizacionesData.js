import { useState, useEffect } from "react";
import { getAllcotizacionesdata } from "../../../apis/ApisServicioCliente/CotizacionApi";

export const useCotizacionesData = (organizationId) => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getAllcotizacionesdata(organizationId);

        const cotizacionesValidadas = (response.data || []).map((c) => {
          const clienteIncompleto = !c["Correo"] || !c["CodigoPostal"];
          const empresaIncompleta = !c["CalleEmpresa"] || !c["rfcEmpresa"];
          return {
            ...c,
            incompleto: clienteIncompleto || empresaIncompleta,
          };
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
