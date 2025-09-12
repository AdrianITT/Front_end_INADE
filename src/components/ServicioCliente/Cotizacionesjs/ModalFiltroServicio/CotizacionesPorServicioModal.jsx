import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Modal, Table, Input, Select, Space, message, Empty } from "antd";
import debounce from "lodash/debounce";
import { getCotizacionesByServicioOrg} from "../../../../apis/ApisServicioCliente/CotizacionApi";
import {getServicioData} from "../../../../apis/ApisServicioCliente/ServiciosApi";

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
    { title: "Moneda ID", dataIndex: "tipoMoneda" },
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

  return (
    <Modal
      title="Cotizaciones por servicio"
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
      destroyOnClose
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
        />
      )}
    </Modal>
  );
};

export default CotizacionesPorServicioModal;
