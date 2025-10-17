// confirmarTipoCambioBanxicoConManual.jsx
import React, { useState } from "react";
import { Modal, Select, Space, Typography, Spin, Alert, message, Radio, InputNumber, Button } from "antd";
import dayjs from "dayjs";
import { getBanxicoFixRange } from "../../../../apis/ApisServicioCliente/ApiBanxico";

const { Text } = Typography;

// Fechas de los últimos N días en formato YYYY-MM-DD
const createDateOptions = (daysBack = 60) => {
  const dates = [];
  for (let i = 0; i < daysBack; i++) {
    dates.push({
      label: dayjs().subtract(i, "day").format("YYYY-MM-DD"),
      value: dayjs().subtract(i, "day").format("YYYY-MM-DD"),
    });
  }
  return dates.reverse();
};

// Componente interno del modal
const ExchangeRateSelector = ({ dateOptions, onRateSelect, serie = "SF43718" }) => {
  const [dateFrom, setDateFrom] = useState(dateOptions[0]?.value);
  const [dateTo, setDateTo] = useState(dateOptions[dateOptions.length - 1]?.value);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState([]);                 // [{label, value, numericValue}]
  const [selectedRate, setSelectedRate] = useState();     // value del Select
  const [mode, setMode] = useState("banxico");            // "banxico" | "manual"
  const [manual, setManual] = useState(null);             // número manual
  const [warn, setWarn] = useState(null);

  const fetchRates = async () => {
    if (!dateFrom || !dateTo) return;
    if (dayjs(dateTo).isBefore(dayjs(dateFrom), "day")) {
      setWarn("La fecha hasta debe ser mayor o igual a la fecha desde.");
      setRates([]); setSelectedRate(undefined);
      if (mode === "banxico") onRateSelect(null);
      return;
    }
    setWarn(null);
    setLoading(true);
    setRates([]); setSelectedRate(undefined);
    if (mode === "banxico") onRateSelect(null);

    try {
      const { data } = await getBanxicoFixRange(dateFrom, dateTo, serie);
      const datos = data?.bmx?.series?.[0]?.datos || [];
      const opts = datos.map((d) => ({
        label: `${d.fecha} — ${d.dato}`,     // d.fecha: "DD/MM/YYYY"
        value: `${d.fecha}|${d.dato}`,
        numericValue: parseFloat(d.dato),
      }));
      setRates(opts);

      // Autoseleccionar el último (más reciente) como referencia
      if (opts.length) {
        const last = opts[opts.length - 1];
        setSelectedRate(last.value);
        if (mode === "banxico") onRateSelect(last.numericValue);
        // Si el usuario luego cambia a "manual", dejamos precargado ese número como referencia
        if (manual == null) setManual(last.numericValue);
      }
    } catch (e) {
      setWarn("Error al consultar Banxico. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const applySelected = (val) => {
    setSelectedRate(val);
    const found = rates.find((r) => r.value === val);
    if (mode === "banxico") onRateSelect(found ? found.numericValue : null);
  };

  const applyManual = (num) => {
    setManual(num);
    if (mode === "manual") onRateSelect(Number(num) || null);
  };

  const copyFromSelected = () => {
    const found = rates.find((r) => r.value === selectedRate);
    if (found) setManual(found.numericValue);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="small">
      {/* Fechas desde/hasta */}
      <Text>Fecha desde</Text>
      <Select options={dateOptions} value={dateFrom} onChange={setDateFrom} showSearch style={{ width: "100%" }} />
      <Text>Fecha hasta</Text>
      <Select options={dateOptions} value={dateTo} onChange={setDateTo} showSearch style={{ width: "100%" }} />

      <Space align="center">
        <Button type="link" onClick={fetchRates}>Consultar tipos de cambio</Button>
        {loading && <Spin size="small" />}
      </Space>

      {warn && <Alert type="warning" showIcon message={warn} />}

      {/* Modo de selección */}
      <Radio.Group
        value={mode}
        onChange={(e) => {
          const m = e.target.value;
          setMode(m);
          // Actualiza la tasa enviada al padre según el modo actual
          if (m === "banxico") {
            const found = rates.find((r) => r.value === selectedRate);
            onRateSelect(found ? found.numericValue : null);
          } else {
            onRateSelect(Number(manual) || null);
          }
        }}
      >
        <Radio value="banxico">Usar tasa de Banxico</Radio>
        <Radio value="manual">Ingresar tasa manual</Radio>
      </Radio.Group>

      {/* Select de Banxico (se desactiva si está en modo manual) */}
      <Select
        disabled={mode === "manual"}
        placeholder="Fecha — Tipo de cambio"
        options={rates}
        value={selectedRate}
        onChange={applySelected}
        showSearch
        optionFilterProp="label"
        notFoundContent={loading ? <Spin size="small" /> : "Sin datos"}
        style={{ width: "100%" }}
      />

      {/* Campo manual */}
      <Space.Compact style={{ width: "100%" }}>
        <InputNumber
          disabled={mode === "banxico"}
          min={0.0001}
          step={0.0001}
          precision={4}
          style={{ width: "100%" }}
          value={manual}
          onChange={applyManual}
          placeholder="Ingresa tu tipo de cambio (ej. 18.7500)"
        />
        {/* <Button disabled={mode === "banxico" || !selectedRate} onClick={copyFromSelected}>
          Copiar seleccionado
        </Button> */}
      </Space.Compact>
    </Space>
  );
};

// Función exportada (abre el modal y resuelve con number o null)
export function confirmTipoCambioBanxicoSelects({ daysBack = 60, serie = "SF43718" } = {}) {
  return new Promise((resolve) => {
    let chosen = null;
    const dateOptions = createDateOptions(daysBack);

    const onRateSelect = (rate) => { chosen = rate; };

    Modal.confirm({
      title: "Tipo de cambio (Banxico o manual)",
      width: 560,
      content: (
        <ExchangeRateSelector
          dateOptions={dateOptions}
          onRateSelect={onRateSelect}
          serie={serie}
        />
      ),
      okText: "Usar este tipo de cambio",
      cancelText: "Cancelar",
      onOk: () => {
        if (!chosen || !isFinite(chosen) || Number(chosen) <= 0) {
          message.error("Selecciona o ingresa un tipo de cambio válido (> 0).");
          return Promise.reject();
        }
        resolve(Number(chosen));
      },
      onCancel: () => resolve(null),
    });
  });
}
