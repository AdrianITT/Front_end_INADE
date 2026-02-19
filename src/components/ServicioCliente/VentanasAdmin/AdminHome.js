import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCotizacionesDetalleAd } from "../../../apis/ApisServicioCliente/ApiAdmin/AdminApi";
import StockCharts from "./StockCharts";

// ---- Theme ----
const theme = {
  bg: "#F8FAFC", // slate-50
  card: "#FFFFFF",
  grid: "#EAECEF",
  axis: "#94A3B8",
  text: "#0F172A",
  subtext: "#64748B",
  tooltipBg: "rgba(15, 23, 42, 0.92)",
  tooltipBorder: "rgba(255,255,255,0.12)",
  tooltipText: "#F8FAFC",
  bar: "#6366F1",
  barSoft: "rgba(99,102,241,0.10)",
  border: "rgba(15,23,42,0.08)",
};

const fmt = new Intl.NumberFormat("es-MX");
const cut = (value, n = 24) => {
  const s = String(value ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];

  return (
    <div
      style={{
        background: theme.tooltipBg,
        border: `1px solid ${theme.tooltipBorder}`,
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
        color: theme.tooltipText,
        minWidth: 190,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: p.color || "#fff",
            display: "inline-block",
          }}
        />
        <span style={{ flex: 1, fontSize: 12, opacity: 0.95 }}>
          {p.name || p.dataKey}
        </span>
        <strong style={{ fontSize: 12 }}>{fmt.format(p.value)} </strong>
      </div>
    </div>
  );
}

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

const cardStyle = {
  background: theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 10px 24px rgba(2, 6, 23, 0.06)",
};

const softBtn = (active) => ({
  padding: "7px 11px",
  borderRadius: 999,
  border: `1px solid ${active ? "rgba(99,102,241,0.45)" : theme.border}`,
  background: active ? theme.barSoft : "#fff",
  color: active ? theme.text : "#334155",
  cursor: "pointer",
  fontWeight: active ? 700 : 600,
  fontSize: 13,
  outline: "none",
});

const kpiCard = {
  ...cardStyle,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const HomeAdmin = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("week"); // day | week | month | year
  const [selectedUser, setSelectedUser] = useState("all");

  // orgId robusto
  const organizationId = useMemo(() => {
    const v = parseInt(localStorage.getItem("organizacion_id"), 10);
    return Number.isNaN(v) ? null : v;
  }, []);

  // Fetch
  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading(true);
      try {
        const resp = await getCotizacionesDetalleAd(organizationId);
        setRawData(Array.isArray(resp?.data) ? resp.data : []);
      } catch (e) {
        console.error(e);
        setRawData([]);
        setError("No se pudieron cargar las estadísticas. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId != null) fetchData();
    else setLoading(false);
  }, [organizationId]);

  // Usuarios
  const usuarios = useMemo(() => {
    const nombres = rawData
      .map((item) => (item?.nombreusuario ?? "").toString().trim())
      .filter(Boolean);
    return ["all", ...Array.from(new Set(nombres))];
  }, [rawData]);

  // Filtro user
  const filteredData = useMemo(() => {
    if (selectedUser === "all") return rawData;
    return rawData.filter(
      (item) => (item?.nombreusuario ?? "").toString().trim() === selectedUser
    );
  }, [rawData, selectedUser]);

  // Chart data (con key DAY sin timezone bug)
  const chartData = useMemo(() => {
    const groupMap = new Map();

    filteredData.forEach((item) => {
      const { year, week, months, day, total_cotizaciones } = item || {};
      const total = Number(total_cotizaciones) || 0;

      let key = "";
      let label = "";
      let sortKey = 0;

      switch (viewMode) {
        case "day": {
          const yyyy = year || 0;
          const mm = String(months || 1).padStart(2, "0");
          const dd = String(day || 1).padStart(2, "0");
          key = `${yyyy}-${mm}-${dd}`; // ✅ evita ISO/UTC shifts
          label = `${dd}/${mm}/${yyyy}`;
          sortKey = new Date(yyyy, (months || 1) - 1, day || 1).getTime();
          break;
        }
        case "week": {
          key = `${year}-W${week}`;
          label = `Semana ${week} - ${year}`;
          sortKey = (year || 0) * 100 + (week || 0);
          break;
        }
        case "month": {
          key = `${year}-${months}`;
          const mm = String(months || 1).padStart(2, "0");
          label = `${mm}/${year}`;
          sortKey = (year || 0) * 100 + (months || 0);
          break;
        }
        case "year": {
          key = `${year}`;
          label = `${year}`;
          sortKey = year || 0;
          break;
        }
        default: {
          key = `${year}-W${week}`;
          label = `Semana ${week} - ${year}`;
          sortKey = (year || 0) * 100 + (week || 0);
        }
      }

      if (!groupMap.has(key)) groupMap.set(key, { label, total: 0, sortKey });
      const current = groupMap.get(key);
      current.total += total;
      groupMap.set(key, current);
    });

    const arr = Array.from(groupMap.values()).sort((a, b) => a.sortKey - b.sortKey);

    // ✅ limita puntos para que el eje X no explote
    const limits = { day: 30, week: 14, month: 18, year: 10 };
    const limit = limits[viewMode] ?? 50;

    return arr.length > limit ? arr.slice(-limit) : arr;
  }, [filteredData, viewMode]);

  // KPIs (dashboard feel)
  const kpis = useMemo(() => {
    const total = chartData.reduce((s, x) => s + (x.total || 0), 0);
    const avg = chartData.length ? total / chartData.length : 0;
    let maxItem = null;
    for (const x of chartData) {
      if (!maxItem || x.total > maxItem.total) maxItem = x;
    }
    return { total, avg, maxItem };
  }, [chartData]);

  const showLabels = chartData.length > 0 && chartData.length <= 12;

  if (loading) {
    return (
      <div style={{ padding: 16, background: theme.bg, minHeight: "100vh" }}>
        <div style={{ ...cardStyle, maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ margin: 0, color: theme.text }}>Cargando datos…</h2>
          <p style={{ margin: "8px 0 0", color: theme.subtext, fontSize: 13 }}>
            Preparando estadísticas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      {/* Container */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        {/* Header / Toolbar */}
        <div
          style={{
            ...cardStyle,
            marginBottom: 14,
            padding: 18,
            display: "flex",
            gap: 14,
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: theme.text, letterSpacing: -0.3 }}>
              Estadísticas
            </h1>
            <p style={{ margin: "6px 0 0", color: theme.subtext, fontSize: 13 }}>
              Filtra por periodo y usuario para ver el comportamiento de cotizaciones.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setViewMode("week");
                setSelectedUser("all");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
              }}
              title="Restablecer filtros"
            >
              Reset
            </button>

            <div style={{ height: 34, width: 1, background: theme.grid }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#334155", fontSize: 13, fontWeight: 600 }}>
                Usuario:
              </span>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: "8px 10px",
                  outline: "none",
                  background: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {usuarios.map((user) => (
                  <option key={user} value={user}>
                    {user === "all" ? "Todos" : user}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ViewMode pills */}
          <div style={{ width: "100%", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#334155", fontSize: 13, fontWeight: 600, marginRight: 4 }}>
              Ver por:
            </span>
            <button onClick={() => setViewMode("day")} style={softBtn(viewMode === "day")}>
              Día
            </button>
            <button onClick={() => setViewMode("week")} style={softBtn(viewMode === "week")}>
              Semana
            </button>
            <button onClick={() => setViewMode("month")} style={softBtn(viewMode === "month")}>
              Mes
            </button>
            <button onClick={() => setViewMode("year")} style={softBtn(viewMode === "year")}>
              Año
            </button>
          </div>
        </div>

        {/* Error / Empty */}
        {error && (
          <div style={{ ...cardStyle, marginBottom: 14, borderColor: "rgba(239,68,68,0.25)" }}>
            <h3 style={{ margin: 0, color: theme.text }}>Ocurrió un problema</h3>
            <p style={{ margin: "8px 0 0", color: theme.subtext, fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* KPI Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={kpiCard}>
            <div style={{ color: theme.subtext, fontSize: 12, fontWeight: 700 }}>
              Total (visible)
            </div>
            <div style={{ color: theme.text, fontSize: 22, fontWeight: 800 }}>
              {fmt.format(kpis.total)}
            </div>
            <div style={{ color: theme.subtext, fontSize: 12 }}>
              Suma de cotizaciones del periodo mostrado
            </div>
          </div>

          <div style={kpiCard}>
            <div style={{ color: theme.subtext, fontSize: 12, fontWeight: 700 }}>
              Promedio por {viewMode}
            </div>
            <div style={{ color: theme.text, fontSize: 22, fontWeight: 800 }}>
              {fmt.format(Math.round(kpis.avg))}
            </div>
            <div style={{ color: theme.subtext, fontSize: 12 }}>
              Media del periodo visible
            </div>
          </div>

          <div style={kpiCard}>
            <div style={{ color: theme.subtext, fontSize: 12, fontWeight: 700 }}>
              Pico
            </div>
            <div style={{ color: theme.text, fontSize: 22, fontWeight: 800 }}>
              {kpis.maxItem ? fmt.format(kpis.maxItem.total) : "—"}
            </div>
            <div style={{ color: theme.subtext, fontSize: 12 }}>
              {kpis.maxItem ? kpis.maxItem.label : "Sin datos"}
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, color: theme.text, fontSize: 16 }}>
                Total de cotizaciones ({viewMode})
              </h2>
              <p style={{ margin: "6px 0 0", color: theme.subtext, fontSize: 13 }}>
                Mostrando {chartData.length} periodos (limitado para mejor lectura)
              </p>
            </div>

            <div style={{ color: theme.subtext, fontSize: 12, fontWeight: 700 }}>
              {selectedUser === "all" ? "Todos los usuarios" : `Usuario: ${selectedUser}`}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{ padding: "22px 4px", color: theme.subtext, fontSize: 13 }}>
              No hay datos para los filtros seleccionados.
            </div>
          ) : (
            <div style={{ width: "100%", height: 420, marginTop: 12 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 10, bottom: 38 }}>
                  <defs>
                    <linearGradient id="gradHomeTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.bar} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={theme.bar} stopOpacity={0.55} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid {...gridProps} />

                  <XAxis
                    dataKey="label"
                    {...axisProps}
                    interval="preserveStartEnd"
                    angle={-18}
                    textAnchor="end"
                    height={58}
                    tickFormatter={(v) => cut(v, 26)}
                  />
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
                    name="Total cotizaciones"
                    fill="url(#gradHomeTotal)"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={44}
                    label={
                      showLabels
                        ? { position: "top", fill: theme.subtext, fontSize: 11, fontWeight: 700 }
                        : false
                    }
                    activeBar={{
                      stroke: "rgba(99,102,241,0.35)",
                      strokeWidth: 2,
                      fillOpacity: 1,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Other charts */}
        <div style={{ marginTop: 14 }}>
          <StockCharts />
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
