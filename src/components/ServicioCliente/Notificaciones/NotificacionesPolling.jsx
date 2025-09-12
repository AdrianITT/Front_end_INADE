import React, { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { getAllPrecotizacionByOrganizacion } from "../../../apis/ApisServicioCliente/PrecotizacionApi";

const NotificacionesPolling = () => {
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);
  const notificadosRef = useRef(new Set());

  // Crear instancia de notificaciones con stack y threshold
  const [api, contextHolder] = notification.useNotification({
    stack: {
      threshold: 3, // máximo 3 notificaciones visibles
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      getAllPrecotizacionByOrganizacion(organizationId)
        .then((res) => {

          res.data.forEach((precotizacion) => {
            if (
              precotizacion.estado?.estadoId === 8 &&
              !notificadosRef.current.has(precotizacion.id)
            ) {
              api.info({
                message: 'Nueva Pre-Cotización',
                description: `ID: ${precotizacion.precotizacionId}, Cliente: ${precotizacion.nombreCliente}`,
                placement: 'topRight',
                duration: null, // ❗ Se mantiene hasta que el usuario la cierre
              });

              notificadosRef.current.add(precotizacion.id);
            }
          });
        })
        .catch((err) => console.error('Error al obtener precotizaciones:', err));
    }, 10000); // cada 10 segundos

    return () => clearInterval(interval);
  }, [organizationId, api]);

  return <>{contextHolder}</>;
};

export default NotificacionesPolling;
