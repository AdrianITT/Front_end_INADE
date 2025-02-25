// src/hooks/useCotizacionDetails.js
import { useState, useEffect } from "react";
import { getAllCotizacion } from "../../../apis/CotizacionApi";
import { getAllCliente } from "../../../apis/ClienteApi";
import { getAllTipoMoneda } from "../../../apis/Moneda";
import { getAllEmpresas } from "../../../apis/EmpresaApi";
import { getAllIva } from "../../../apis/ivaApi";
import { getAllServicio } from "../../../apis/ServiciosApi";
import { getAllCotizacionServicio } from "../../../apis/CotizacionServicioApi";
import { getInfoSistema } from "../../../apis/InfoSistemaApi";

export const useCotizacionDetails = (id) => {
  const [cotizacionInfo, setCotizacionInfo] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [tipoMoneda, setTipoMoneda] = useState({});
  const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          cotizacionesRes,
          clientesRes,
          monedasRes,
          empresasRes,
          ivaRes,
          serviciosRes,
          cotServRes,
          sistemaRes,
        ] = await Promise.all([
          getAllCotizacion(),
          getAllCliente(),
          getAllTipoMoneda(),
          getAllEmpresas(),
          getAllIva(),
          getAllServicio(),
          getAllCotizacionServicio(),
          getInfoSistema(),
        ]);

        // 1. Buscar la cotización específica
        const cotizacionData = cotizacionesRes.data.find(
          (cot) => cot.id === parseInt(id)
        );

        if (cotizacionData) {
          // 2. Encontrar datos de cliente, empresa, moneda, IVA
          const cliente = clientesRes.data.find(
            (c) => c.id === cotizacionData.cliente
          );
          const empresa = empresasRes.data.find(
            (e) => e.id === cliente?.empresa
          );
          const moneda = monedasRes.data.find(
            (m) => m.id === cotizacionData.tipoMoneda
          );
          const ivaItem = ivaRes.data.find((iva) => iva.id === cotizacionData.iva);

          // 3. Crear objeto con detalles de la cotización
          const cotizacionConDetalles = {
            ...cotizacionData,
            clienteNombre: `${cliente?.nombrePila} ${cliente?.apPaterno} ${cliente?.apMaterno}`.trim(),
            empresaNombre: empresa?.nombre,
            monedaNombre: moneda?.codigo,
            direccion: `${empresa?.calle} ${empresa?.numero} ${empresa?.colonia} ${empresa?.ciudad} ${empresa?.estado} ${empresa?.codigoPostal}`,
            tasaIVA: ivaItem?.porcentaje,
            fechaSolicitud: cotizacionData?.fechaSolicitud,
            fechaCaducidad: cotizacionData?.fechaCaducidad,
            // Inicialmente, precio = cotizacionData.precio (de la base de datos)
            precio: cotizacionData.precio, 
            correo: cliente?.correo,
          };

          setCotizacionInfo(cotizacionConDetalles);
          setTipoMoneda(moneda);

          // Obtener tipo de cambio
          const tipoCambio = parseFloat(sistemaRes.data[0].tipoCambioDolar);
          setTipoCambioDolar(tipoCambio);

          // 4. Procesar servicios relacionados
          if (cotizacionData.servicios && Array.isArray(cotizacionData.servicios)) {
            const serviciosRelacionados = cotizacionData.servicios;

            // Filtrar los servicios que pertenecen a esta cotización
            const serviciosFiltrados = serviciosRes.data.filter((serv) =>
              serviciosRelacionados.includes(serv.id)
            );

            // Combinar con cotServRes para obtener cantidades, precios, etc.
            const serviciosConCantidad = serviciosFiltrados.map((servicio) => {
              const cotServ = cotServRes.data.find(
                (cs) =>
                  cs.servicio === servicio.id &&
                  cs.cotizacion === cotizacionData.id
              );
              return {
                ...servicio,
                cantidad: cotServ ? cotServ.cantidad : 0,
                precio: cotServ ? cotServ.precio : 0,
                subtotal: cotServ ? cotServ.cantidad * cotServ.precio : 0,
                descripcion: cotServ ? cotServ.descripcion : "Sin descripción",
              };
            });

            // Guardar servicios en el estado
            setServicios(serviciosConCantidad);

            // 5. Sumar subtotales y actualizar cotizacionInfo.precio
            const totalServicios = serviciosConCantidad.reduce(
              (acc, s) => acc + (s.subtotal || 0),
              0
            );

            // Sobrescribir la propiedad 'precio' con la suma real
            setCotizacionInfo((prev) => ({
              ...prev,
              precio: totalServicios,
            }));
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de cotización:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { cotizacionInfo, servicios, tipoMoneda, tipoCambioDolar, loading };
};
