import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Modal, Table, Input, Select, Space, message, Empty } from "antd";
import debounce from "lodash/debounce";
import { getCotizacionesByServicioOrg, getDetallecotizaciondataById} from "../../../../apis/ApisServicioCliente/CotizacionApi";
import {getServicioData} from "../../../../apis/ApisServicioCliente/ServiciosApi";
import CotizacionDetalleExpand from "../CotizacionDetalleExpand/CotizacionDetalleExpand";
import { useNavigate } from "react-router-dom";
import { cifrarId } from "../../secretKey/SecretKey";

const { Option } = Select;

const CotizacionesPorServicioModal = ({
  open,
  onClose,
  orgId,
  initialServicioId = null,    // opcional: si quieres abrir ya con un servicio seleccionado
  onRowClick,                  // opcional: callback al hacer click en una fila
  pageSizeDefault = 10,
  servicios: serviciosProp,    // opcional: si ya traes la lista de servicios desde afuera
}) => {
  const navigate = useNavigate();
  // --- NUEVO: estados para expandibles en el modal ---
  const [expandedData, setExpandedData] = useState({});
  const [loadingRows, setLoadingRows] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const formatCurrency = (value) =>
    `$${Number(value).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  // Estados
  const [servicioId, setServicioId] = useState(initialServicioId);
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);

  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: pageSizeDefault, total: 0 });
  const [sorterState, setSorterState] = useState({}); // {field, order}

  // AbortControllers
  const serviciosCtrlRef = useRef(null);
  const cotizCtrlRef = useRef(null);

  // Columnas (usar dataIndex alineado con tu SORT_MAP del backend: id, numero, Solicitud, Expiración)
  const columns = useMemo(() => ([
//     { title: "Cotización", dataIndex: "id", sorter: true },
    { title: "Cotización", dataIndex: "numero", sorter: true },
    { title: "Solicitud", dataIndex: "fechaSolicitud", sorter: true },
    { title: "Expiración", dataIndex: "fechaCaducidad", sorter: true },
    { title: "Cliente ID", dataIndex: "cliente" },
    { title: "Empresa", dataIndex: "empresa" },
  ]), []);

  // Carga de servicios (si no vienen por props)
  const fetchServicios = useCallback(async () => {
    if (!open || !orgId || serviciosProp) return;
    serviciosCtrlRef.current?.abort?.();
    const controller = new AbortController();
    serviciosCtrlRef.current = controller;

    setLoadingServicios(true);
    try {
      const res = await getServicioData(orgId);
      const list = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      // normaliza: espera objetos { id, nombre } o ajusta a tu payload real
      const normalized = list.map(s => ({
        id: s.id,
        nombre: s.nombre || s.nombreServicio || s.descripcion || `Servicio ${s.id}`,
      }));
      setServicios(normalized);
    } catch (e) {
      if (e.name !== "AbortError" && e.name !== "CanceledError") {
        console.error(e);
        message.error("No se pudieron cargar los servicios.");
      }
    } finally {
      setLoadingServicios(false);
    }
  }, [open, orgId, serviciosProp]);

  // Carga de cotizaciones
  const fetchCotizaciones = useCallback(async ({ current, pageSize, search, sorter }) => {
    if (!open || !orgId || !servicioId) return;

    cotizCtrlRef.current?.abort?.();
    const controller = new AbortController();
    cotizCtrlRef.current = controller;

    setLoading(true);
    try {
      const sortParam = sorter?.field ? `${sorter.order === "descend" ? "-" : ""}${sorter.field}` : "";
      const res = await getCotizacionesByServicioOrg(
        orgId,
        servicioId,
        { page: current, pageSize, search, sort: sortParam },
        controller.signal
      );

      const results = Array.isArray(res.data?.results)
        ? res.data.results
        : (Array.isArray(res.data) ? res.data : []);
      const count = typeof res.data?.count === "number" ? res.data.count : results.length;

      setData(results);
      setPagination((p) => ({ ...p, current, pageSize, total: count }));
    } catch (e) {
      if (e.name !== "AbortError" && e.name !== "CanceledError") {
        console.error(e);
        message.error("No se pudieron cargar las cotizaciones.");
      }
    } finally {
      setLoading(false);
    }
  }, [open, orgId, servicioId]);

  // Debounce de búsqueda
  const debouncedSearch = useMemo(
    () =>
      debounce((val) => {
        fetchCotizaciones({
          current: 1,
          pageSize: pagination.pageSize,
          search: val,
          sorter: sorterState,
        });
      }, 300),
    [pagination.pageSize, sorterState, fetchCotizaciones]
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  // Reset y cargas al abrir
  useEffect(() => {
    if (!open) return;
    // setear servicios iniciales si vienen por prop
    if (serviciosProp) {
      const normalized = serviciosProp.map(s => ({
        id: s.id,
        nombre: s.nombre || s.nombreServicio || s.descripcion || `Servicio ${s.id}`,
      }));
      setServicios(normalized);
    } else {
      fetchServicios();
    }

    setSearchText("");
    setPagination((p) => ({ ...p, current: 1 }));
    // si viene un servicio preseleccionado, carga; si no, espera a que el usuario elija
    if (initialServicioId) {
      setServicioId(initialServicioId);
    } else {
      setServicioId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orgId]);

  // Cuando cambia el servicio, carga la página 1
  useEffect(() => {
    if (open && servicioId) {
      fetchCotizaciones({ current: 1, pageSize: pageSizeDefault, search: "", sorter: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicioId]);

  // AntD Table change
  const handleTableChange = (newPagination, _filters, sorter) => {
    setSorterState(sorter);
    setPagination((p) => ({ ...p, current: newPagination.current, pageSize: newPagination.pageSize }));
    fetchCotizaciones({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      search: searchText,
      sorter,
    });
  };

  const handleExpand = useCallback(
    async (expanded, record) => {
      const id = record.id; // en el modal usas rowKey = r.id
      if (expanded) {
        setExpandedRowKeys((prev) => (prev.includes(id) ? prev : [...prev, id]));
      } else {
        setExpandedRowKeys((prev) => prev.filter((k) => k !== id));
      }

      if (expanded && !expandedData[id]) {
        try {
          setLoadingRows((prev) => ({ ...prev, [id]: true }));
          const detalle = await getDetallecotizaciondataById(id);
          setExpandedData((prev) => ({ ...prev, [id]: detalle }));
        } catch (error) {
          console.error(`Error al obtener detalle de cotización ${id}:`, error);
          message.error("No se pudo cargar el detalle de la cotización.");
        } finally {
          setLoadingRows((prev) => ({ ...prev, [id]: false }));
        }
      }
    },
    [expandedData]
  );

  return (
    <Modal
      title="Cotizaciones por servicio"
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
      destroyOnClose
      styles={{ 
        body:{
          maxHeight: '70vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '12px',
        }
      }}
    >
      <Space style={{ width: "100%", marginBottom: 12 }} wrap>
        <Select
          showSearch
          loading={loadingServicios}
          placeholder="Selecciona un servicio"
          value={servicioId ?? undefined}
          onChange={(val) => {
            setServicioId(val);
            // al cambiar servicio, la carga se dispara con el useEffect
          }}
          optionFilterProp="label"
          style={{ minWidth: 280 }}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {servicios.map((s) => (
            <Option key={s.id} value={s.id} label={s.nombre}>
              {s.nombre}
            </Option>
          ))}
        </Select>

        <Input.Search
          allowClear
          placeholder="Buscar…"
          value={searchText}
          disabled={!servicioId}
          onChange={(e) => {
            const val = e.target.value || "";
            setSearchText(val);
            debouncedSearch(val);
          }}
          style={{ width: "clamp(220px, 40vw, 360px)" }}
        />
      </Space>

      {!servicioId ? (
        <Empty description="Selecciona un servicio para ver cotizaciones" />
      ) : (
        <Table
          rowKey={(r) => r.id}
          dataSource={data}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => onRowClick?.(record),
            style: { cursor: onRowClick ? "pointer" : "default" },
          })}

          expandable={{
            expandedRowKeys,
            onExpand: handleExpand,
            onExpandedRowsChange: setExpandedRowKeys,
            rowExpandable: () => true,
            expandedRowRender: (record) => {
              const id = record.id;
              const detalle = expandedData[id];

              if (loadingRows[id]) return <p>Cargando detalles...</p>;
              if (!detalle) return <p>Sin datos adicionales.</p>;

              return (
                <CotizacionDetalleExpand
                  detalle={detalle}
                  navigate={navigate}
                  cifrarId={cifrarId}
                  formatCurrency={formatCurrency}
                />
              );
            },
          }}
        />
      )}
    </Modal>
  );
};

export default CotizacionesPorServicioModal;
