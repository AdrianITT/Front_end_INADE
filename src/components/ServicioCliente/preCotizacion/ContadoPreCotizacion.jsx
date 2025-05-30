import React, { useState, useEffect } from "react";
import {Row, Col, Statistic, Card} from "antd";
import {ContadoPrecotizaciones} from "../../../apis/ApisServicioCliente/ContadorPrecotizacionApi";

const ContadorPreCotizacion = () => {
  const [data, setData] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const organizationId = parseInt(localStorage.getItem("organizacion_id"), 10);

  useEffect(()=>{
     ContadoPrecotizaciones(organizationId).then(({data})=>{setData(data)});
  },[]);

  const containerStyle = {
     display: "flex",
     gap: 16,
     margin: "24px 0"
   };


  return (
<>
      {/*  ↓ Aquí va el número de pendientes */}
{/* Estadísticas */}
<Row
   gutter={16}
   justify="space-between"
   align="middle"            /* ← centra verticalmente todo el contenido */
   style={{ margin: "24px 0" }}>
        {/** Tarjeta 1 **/}
        <Col xs={24} sm={12} md={8}>
          <Card bodyStyle={{ padding: 5 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Total del Mes:</span>
              <span style={{ fontSize: 24 }}>
                {data.TotalPrecotizacion}
              </span>
            </div>
          </Card>
        </Col>

        {/** Tarjeta 2 **/}
        <Col xs={24} sm={12} md={8}>
          <Card bodyStyle={{ padding: 5 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Pendientes:</span>
              <span style={{ fontSize: 24, color: "#cf1322" }}>
                {data.precotizacionNoAceptadas}
              </span>
            </div>
          </Card>
        </Col>

        {/** Tarjeta 3 **/}
        <Col xs={24} sm={12} md={8}>
          <Card bodyStyle={{ padding: 5 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Pendientes Bot:</span>
              <span style={{ fontSize: 24, color: "#cf1322" }}>
                {data.precotizacionNoAceptadasChatbot}
              </span>
            </div>
          </Card>
        </Col>
      </Row>
</>

  );
};

export default ContadorPreCotizacion;