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
} from "recharts";
import { getAllcotizacionesdata } from "../../../apis/ApisServicioCliente/CotizacionApi";

/**
 * ✅ Fixes / mejoras:
 * - Quita imports no usados (getCotizacionesDetalleAd, Rectangle)
 * - LineChart: usa `stroke` (NO `fill`) y agrega `strokeWidth`, `dot`, `activeDot`
 * - Tooltip custom bonito y consistente
 * - Ejes con mejor estilo (sin tickLine, axisLine suave)
 * - Labels largos recortados (estado/empresa/periodo)
 * - Gradientes + bordes redondeados en barras
 * - Legend más limpio
 */

const nombresMes = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const theme = {
  grid: "#EAECEF",
  axis: "#94A3B8",
  text: "#0F172A",
  tooltipBg: "rgba(15, 23, 42, 0.92)",
  tooltipBorder: "rgba(255,255,255,0.12)",
  tooltipText: "#F8FAFC",
};

const commonMargin = { top: 12, right: 18, left: 10, bottom: 28 };

const cut = (value, n = 18) => {
  const s = String(value ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: theme.tooltipBg,
        border: `1px solid ${theme.tooltipBorder}`,
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
        color: theme.tooltipText,
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>{label}</div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: p.color || "#fff",
              display: "inline-block",
            }}
          />
          <span style={{ flex: 1, fontSize: 12, opacity: 0.95 }}>{p.name || p.dataKey}</span>
          <strong style={{ fontSize: 12 }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  background: "#FFFFFF",
  border: `1px solid ${theme.grid}`,
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 24px rgba(2, 6, 23, 0.06)",
  marginTop: "1.5rem",
};

const axisProps = {
  tickLine: false,
  axisLine: { stroke: theme.grid },
  tick: { fill: theme.axis, fontSize: 12 },
};

const gridProps = {
  stroke: theme.grid,
  strokeDasharray: "4 6",
  vertical: false,
};

const StockCharts = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const organizationId = useMemo(() => {
    const v = parseInt(localStorage.getItem("organizacion_id"), 10);
    return Number.isNaN(v) ? null : v;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getAllcotizacionesdata(organizationId);
        setRawData(Array.isArray(resp?.data) ? resp.data : []);
      } catch (error) {
        console.error("Error al cargar datos de cotizaciones:", error);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId != null) fetchData();
    else setLoading(false);
  }, [organizationId]);

  // 1) Cotizaciones por Estado
  const dataPorEstado = useMemo(() => {
    const map = new Map();

    rawData.forEach((item) => {
      const nombreEstado = item?.Estado?.nombre || "Sin estado";
      if (!map.has(nombreEstado)) map.set(nombreEstado, { estado: nombreEstado, total: 0 });
      map.get(nombreEstado).total += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [rawData]);

  // 2) Cotizaciones por mes (Solicitud)
  const dataPorMesSolicitud = useMemo(() => {
    const map = new Map();

    rawData.forEach((item) => {
      if (!item?.Solicitud) return;

      const fecha = new Date(item.Solicitud);
      if (Number.isNaN(fecha.getTime())) return;

      const year = fecha.getFullYear();
      const monthIndex = fecha.getMonth();
      const key = `${year}-${monthIndex}`;
      const label = `${nombresMes[monthIndex]} ${year}`;

      if (!map.has(key)) map.set(key, { periodo: label, total: 0, year, monthIndex });
      map.get(key).total += 1;
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
  }, [rawData]);

  // 3) Vencimientos
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
      const expStr = item?.["Expiración"];
      if (!expStr) return;

      const exp = new Date(expStr);
      if (Number.isNaN(exp.getTime())) return;

      const diff = (exp - hoy) / MS_PER_DAY;

      if (diff < 0) buckets.vencida.total += 1;
      else if (diff <= 7) buckets["0-7"].total += 1;
      else if (diff <= 30) buckets["8-30"].total += 1;
      else buckets["31+"].total += 1;
    });

    return Object.values(buckets);
  }, [rawData]);

  // 4) Top empresas
  const dataPorEmpresa = useMemo(() => {
    const map = new Map();

    rawData.forEach((item) => {
      const empresa = item?.Empresa || "Sin empresa";
      if (!map.has(empresa)) map.set(empresa, { empresa, total: 0 });
      map.get(empresa).total += 1;
    });

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [rawData]);

  if (loading) return <div style={{ padding: "1rem" }}>Cargando datos...</div>;

  return (
    <div style={{ padding: "1rem" }}>
      {/* ===== 1. COTIZACIONES POR ESTADO ===== */}
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, color: theme.text }}>Cotizaciones por estado</h2>
        </div>

        <div style={{ width: "100%", height: 320, marginTop: 12 }}>
          <ResponsiveContainer>
            <BarChart data={dataPorEstado} margin={commonMargin}>
              <defs>
                <linearGradient id="gradEstado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0.55} />
                </linearGradient>
              </defs>

              <CartesianGrid {...gridProps} />
              <XAxis dataKey="estado" {...axisProps} tickFormatter={(v) => cut(v, 16)} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: theme.axis }}
              />

              <Bar
                dataKey="total"
                name="Cotizaciones"
                fill="url(#gradEstado)"
                radius={[10, 10, 0, 0]}
                maxBarSize={46}
                activeBar={{ stroke: "rgba(34,197,94,0.35)", strokeWidth: 2, fillOpacity: 1 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== 2. COTIZACIONES POR MES (SOLICITUD) ===== */}
      <section style={cardStyle}>
        <h2 style={{ margin: 0, color: theme.text }}>Cotizaciones por mes de solicitud</h2>

        <div style={{ width: "100%", height: 320, marginTop: 12 }}>
          <ResponsiveContainer>
            <LineChart data={dataPorMesSolicitud} margin={commonMargin}>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="periodo"
                {...axisProps}
                interval="preserveStartEnd"
                angle={-18}
                textAnchor="end"
                height={52}
                tickFormatter={(v) => cut(v, 18)}
              />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: theme.axis }}
              />

              <Line
                type="monotone"
                dataKey="total"
                name="Cotizaciones"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== 3. CONTROL DE VENCIMIENTOS ===== */}
      <section style={cardStyle}>
        <h2 style={{ margin: 0, color: theme.text }}>Control de vencimientos</h2>

        <div style={{ width: "100%", height: 320, marginTop: 12 }}>
          <ResponsiveContainer>
            <BarChart data={dataVencimientos} margin={commonMargin}>
              <defs>
                <linearGradient id="gradVenc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.55} />
                </linearGradient>
              </defs>

              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rango" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: theme.axis }}
              />

              <Bar
                dataKey="total"
                name="Cotizaciones"
                fill="url(#gradVenc)"
                radius={[10, 10, 0, 0]}
                maxBarSize={54}
                activeBar={{ stroke: "rgba(99,102,241,0.35)", strokeWidth: 2, fillOpacity: 1 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ===== 4. COTIZACIONES POR EMPRESA ===== */}
      <section style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, color: theme.text }}>Top empresas por número de cotizaciones</h2>

        <div style={{ width: "100%", height: 340, marginTop: 12 }}>
          <ResponsiveContainer>
            <BarChart
              data={dataPorEmpresa}
              layout="vertical"
              margin={{ top: 10, right: 18, left: 120, bottom: 10 }}
              barCategoryGap={10}
            >
              <defs>
                <linearGradient id="gradEmpresa" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity={0.55} />
                </linearGradient>
              </defs>

              <CartesianGrid {...gridProps} />
              <XAxis type="number" {...axisProps} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="empresa"
                {...axisProps}
                width={110}
                tickFormatter={(v) => cut(v, 16)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: theme.axis }}
              />

              <Bar
                dataKey="total"
                name="Cotizaciones"
                fill="url(#gradEmpresa)"
                radius={[0, 10, 10, 0]}
                maxBarSize={22}
                activeBar={{ stroke: "rgba(168,85,247,0.35)", strokeWidth: 2, fillOpacity: 1 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default StockCharts;
