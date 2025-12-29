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
  Rectangle,
} from "recharts";
import {getCotizacionesDetalleAd} from "../../../apis/ApisServicioCliente/ApiAdmin/AdminApi";
import StockCharts from "./StockCharts";

const HomeAdmin = () => {
  const [rawData, setRawData] = useState([]);        // Datos crudos de la API
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week");  // "day" | "week" | "month" | "year"
  const [selectedUser, setSelectedUser] = useState("all");
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  // 1️⃣ Traer datos desde tu API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getCotizacionesDetalleAd(organizationId); // ajusta a tu endpoint real
        setRawData(Array.isArray(resp.data) ? resp.data : []);
      } catch (error) {
        console.error("Error al cargar datos de cotizaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2️⃣ Obtener lista de usuarios para el select
  const usuarios = useMemo(() => {
    const nombres = rawData.map((item) => item.nombreusuario);
    return ["all", ...Array.from(new Set(nombres))];
  }, [rawData]);

  // 3️⃣ Filtrar por usuario (si no es "all")
  const filteredData = useMemo(() => {
    if (selectedUser === "all") return rawData;
    return rawData.filter((item) => item.nombreusuario === selectedUser);
  }, [rawData, selectedUser]);

  // 4️⃣ Transformar datos según el modo de vista (día, semana, mes, año)
  const chartData = useMemo(() => {
    // agrupamos por "clave" según el viewMode
    const groupMap = new Map();

    filteredData.forEach((item) => {
      const { year, week, months, day, total_cotizaciones } = item;

      let key = "";
      let label = "";
      let sortKey = 0;

      switch (viewMode) {
        case "day": {
          const dateObj = new Date(year, months - 1, day);
          key = dateObj.toISOString().slice(0, 10);
          label = `${day}/${months}/${year}`;
          sortKey = dateObj.getTime();
          break;
        }
        case "week": {
          key = `${year}-W${week}`;
          label = `Semana ${week} - ${months} - ${year}`;
          sortKey = year * 100 + week;
          break;
        }
        case "month": {
          key = `${year}-${months}`;
          label = `${months}/${year}`;
          sortKey = year * 100 + months; 
          break;
        }
        case "year": {
          key = `${year}`;
          label = `${year}`;
          sortKey = year;
          break;
        }
        default:
          key = `${year}-W${week}`;
          label = `Semana ${week} - ${year}`;
          sortKey = year * 100 + months; 
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          label,
          total: 0,
          sortKey,
        });
      }

      const current = groupMap.get(key);
      current.total += total_cotizaciones;
      groupMap.set(key, current);
    });

    // Pasamos el Map a un array para Recharts
    const arr = Array.from(groupMap.values());

    // Ordenar por label (opcional, puedes mejorar esto si quieres orden específico)
    return arr.sort((a, b) => b.sortKey - a.sortKey);
  }, [filteredData, viewMode]);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <center>
      <h1>Estadísticas</h1>
      </center>
      

      {/* Filtros */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {/* Selección de vista: día / semana / mes / año */}
        <div>
          <span style={{ marginRight: 8 }}>Ver por:</span>
          <button
            onClick={() => setViewMode("day")}
            style={{ fontWeight: viewMode === "day" ? "bold" : "normal", marginRight: 4 }}
          >
            Día
          </button>
          <button
            onClick={() => setViewMode("week")}
            style={{ fontWeight: viewMode === "week" ? "bold" : "normal", marginRight: 4 }}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode("month")}
            style={{ fontWeight: viewMode === "month" ? "bold" : "normal", marginRight: 4 }}
          >
            Mes
          </button>
          <button
            onClick={() => setViewMode("year")}
            style={{ fontWeight: viewMode === "year" ? "bold" : "normal" }}
          >
            Año
          </button>
        </div>

        {/* Filtro por usuario */}
        <div>
          <span style={{ marginRight: 8 }}>Usuario:</span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {usuarios.map((user) => (
              <option key={user} value={user}>
                {user === "all" ? "Todos" : user}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfica */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="Total cotizaciones" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
          <StockCharts />
    </div>
  );
};

export default HomeAdmin;
