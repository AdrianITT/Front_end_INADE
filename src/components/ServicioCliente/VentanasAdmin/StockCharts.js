import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import {getCotizacionesDetalleAd} from "../../../apis/ApisServicioCliente/ApiAdmin/AdminApi";
import { getAllcotizacionesdata} from "../../../apis/ApisServicioCliente/CotizacionApi";

const StockCharts = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Si ya guardas la organización en localStorage
  const organizationId = useMemo(
    () => parseInt(localStorage.getItem("organizacion_id"), 10),
    []
  );

  // 1️⃣ Traer datos desde tu API /api/allcotizacionesdata/<org_id>/
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getAllcotizacionesdata(organizationId);
        setRawData(Array.isArray(resp.data) ? resp.data : []);
      } catch (error) {
        console.error("Error al cargar datos de cotizaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(organizationId)) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  // Helper para nombres de mes
  const nombresMes = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  // 2️⃣ Gráfica 1: Cotizaciones por Estado (BarChart)
  const dataPorEstado = useMemo(() => {
    const map = new Map();

    rawData.forEach((item) => {
      const nombreEstado = item.Estado?.nombre || "Sin estado";
      if (!map.has(nombreEstado)) {
        map.set(nombreEstado, { estado: nombreEstado, total: 0 });
      }
      map.get(nombreEstado).total += 1;
    });

    return Array.from(map.values());
  }, [rawData]);

  // 3️⃣ Gráfica 2: Cotizaciones por mes de Solicitud (LineChart o BarChart)
  const dataPorMesSolicitud = useMemo(() => {
    const map = new Map();

    rawData.forEach((item) => {
      if (!item.Solicitud) return;

      const fecha = new Date(item.Solicitud);
      if (Number.isNaN(fecha.getTime())) return;

      const year = fecha.getFullYear();
      const monthIndex = fecha.getMonth(); // 0-11
      const key = `${year}-${monthIndex}`;
      const label = `${nombresMes[monthIndex]} ${year}`;

      if (!map.has(key)) {
        map.set(key, { periodo: label, total: 0, year, monthIndex });
      }
      map.get(key).total += 1;
    });

    // Ordenar por año y mes
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
  }, [rawData]);

  // 4️⃣ Gráfica 3: Control de vencimientos (por rango de días)
  // Rangos: Vencida (<0), 0–7, 8–30, 31+ días
  const dataVencimientos = useMemo(() => {
    const hoy = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const buckets = {
      vencida: { rango: "Vencidas", total: 0 },
      "0-7": { rango: "0-7 días", total: 0 },
      "8-30": { rango: "8-30 días", total: 0 },
      "31+": { rango: "31+ días", total: 0 },
    };

    rawData.forEach((item) => {
      if (!item["Expiración"]) return;
      const exp = new Date(item["Expiración"]);
      if (Number.isNaN(exp.getTime())) return;

      const diff = (exp - hoy) / MS_PER_DAY; // días hacia el futuro (o negativo si ya venció)

      if (diff < 0) {
        buckets.vencida.total += 1;
      } else if (diff <= 7) {
        buckets["0-7"].total += 1;
      } else if (diff <= 30) {
        buckets["8-30"].total += 1;
      } else {
        buckets["31+"].total += 1;
      }
    });

    return Object.values(buckets);
  }, [rawData]);

  // 5️⃣ Gráfica 4: Cotizaciones por Empresa (Top N)
  const dataPorEmpresa = useMemo(() => {
    const map = new Map();

    rawData.forEach((item) => {
      const empresa = item.Empresa || "Sin empresa";
      if (!map.has(empresa)) {
        map.set(empresa, { empresa, total: 0 });
      }
      map.get(empresa).total += 1;
    });

    // Ordenar descendente y tomar top 10
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [rawData]);

  if (loading) {
    return <div style={{ padding: "1rem" }}>Cargando datos...</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>

      {/* ===== 1. COTIZACIONES POR ESTADO ===== */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Cotizaciones por estado</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={dataPorEstado}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estado" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total cotizaciones" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== 2. COTIZACIONES POR MES (SOLICITUD) ===== */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Cotizaciones por mes de solicitud</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={dataPorMesSolicitud}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total cotizaciones"
                dot
                fill="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== 3. CONTROL DE VENCIMIENTOS ===== */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Control de vencimientos</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={dataVencimientos}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rango" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Cotizaciones" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== 4. COTIZACIONES POR EMPRESA ===== */}
      <section style={{ marginTop: "2rem", marginBottom: "3rem" }}>
        <h2>Top empresas por número de cotizaciones</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={dataPorEmpresa}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="empresa" width="auto" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Cotizaciones" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default StockCharts;
