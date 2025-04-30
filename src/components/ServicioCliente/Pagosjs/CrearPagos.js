import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Select, Input, Button, Row, Col, Form, DatePicker, message, Modal, Checkbox } from 'antd';
import { getAllFactura } from '../../../apis/ApisServicioCliente/FacturaApi';
import { getAllFormaPago, getFormaPagoByOrganizacionId} from '../../../apis/ApisServicioCliente/FormaPagoApi';
import { getAllEmpresas } from '../../../apis/ApisServicioCliente/EmpresaApi';
import { getAllCliente } from '../../../apis/ApisServicioCliente/ClienteApi';
import { getAllCotizacion, getCotizacionById} from '../../../apis/ApisServicioCliente/CotizacionApi';
import { getAllCotizacionServicio } from '../../../apis/ApisServicioCliente/CotizacionServicioApi';
import { getAllOrdenesTrabajo } from '../../../apis/ApisServicioCliente/OrdenTrabajoApi';
import { createComprobantepago, dataComprobantePago, dataComprobantePagoFactura } from '../../../apis/ApisServicioCliente/PagosApi';
import { createComprobantepagoFactura, getAllComprobantepagoFactura } from '../../../apis/ApisServicioCliente/ComprobantePagoFacturaApi';
import {getAllMetodopago} from '../../../apis/ApisServicioCliente/MetodoPagoApi';
import { getIvaById } from '../../../apis/ApisServicioCliente/ivaApi';

const { Option } = Select;
const { TextArea } = Input;

const CrearPagos = () => {
  const navigate = useNavigate();
  const [cotizacionId, setcotizacionId]=useState();
  const { id } = useParams();
  // Estado para clientes (API)w
  const [clientesData, setClientesData] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clientesFactura, setClientesFactura] = useState({});
  
  // Estado para facturas (API)
  const [facturasData, setFacturasData] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [facturasPorCliente, setFacturasPorCliente] = useState([]);


  // Estado para formas de pago (API)
  const [formasPagoData, setFormasPagoData] = useState([]);
  const [loadingFormasPago, setLoadingFormasPago] = useState(false);

  // Obtener el ID de la organización (se hace una sola vez)
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  // Estado para el cliente seleccionado
  const [selectedClient, setSelectedClient] = useState(null);

  // Estado para almacenar la lista de métodos de pago
  const [, setMetodosPago] = useState([]);
  // Estado para indicar si se están cargando los métodos
  const [, setLoadingMetodos] = useState(false);

  // Estados globales fuera del array de facturas:
const [fechaSolicitada, setFechaSolicitada] = useState(null);
const [formaPagoGlobal, setFormaPagoGlobal] = useState('');
//const [metodoPagoGlobal, setMetodoPagoGlobal] = useState(null);
const [comprobantesData, setComprobantesData] = useState([]);


  // Estado local para el formulario de facturas
  const [facturas, setFacturas] = useState([
    {
      id: 1,
      factura: '',
      fechaSolicitada: null,
      formaPago: '',
      precioTotal: '',
      precioPagar: '',
      precioRestante: '',
    },
  ]);

  /*useEffect(() => {
    // Cuando el cliente cambia, limpiamos el select de factura y los campos
    setFacturas((prevFacturas) =>
      prevFacturas.map((fact) => ({
        ...fact,
        factura: '',        // Limpia la selección de factura
        precioTotal: '',    // Limpia el precio total
        precioPagar: '',    // Limpia el precio a pagar
        precioRestante: '', // Limpia el precio restante
        // si tienes más campos, los dejas o reinicias según tu necesidad
      }))
    );
  }, [selectedClient]); */
  

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClientes = async () => {
      setLoadingClientes(true);
      try {
        const response = await getFormaPagoByOrganizacionId(organizationId);
        console.log('response.data',response.data);
        setClientesData(response.data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoadingClientes(false);
      }
    };
    const fetchMetodosPago = async () => {
      setLoadingMetodos(true);
      try {
        const response = await getAllMetodopago();
        setMetodosPago(response.data);
        //console.log('response.data',response.data);
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
      } finally {
        setLoadingMetodos(false);
      }
    };
    fetchMetodosPago();
    fetchClientes();
  }, []);


useEffect(() => {
  const fetchComprobantes = async () => {
    try {
      const response = await getAllComprobantepagoFactura();
      setComprobantesData(response.data);
    } catch (error) {
      console.error("Error al obtener comprobantes:", error);
    }
  };
  fetchComprobantes();
}, []);

const facturasConMontorestanteCero = useMemo(() => {
  return comprobantesData
    .filter(cf => Number(cf.montorestante) === 0)
    .map(cf => cf.factura);
}, [comprobantesData]);
  
  useEffect(() => {
    if (!id) return;
  
    const fetchDatosIniciales = async () => {
      try {
        // 1. Obtener los datos del comprobante
        const res = await dataComprobantePago(id);
        const clienteId = res.data.cliente_id;
        setSelectedClient(clienteId); // 👈 esto dispara el otro useEffect que carga facturas
  
        // 2. Preseleccionar la factura en el formulario
        //await handleSelectChange(1, parseInt(id));
        setFacturas(prev =>
          prev.map((item, index) =>
            index === 0 ? { ...item, factura: parseInt(id) } : item
          )
        ); 
  
      } catch (error) {
        console.error("Error al obtener datos del comprobante:", error);
      }
    };
  
    fetchDatosIniciales();
  }, [id]);
  // Cargar facturas filtradas por organización y cliente
  useEffect(() => {
    const fetchFacturasPorCliente = async () => {
      if (!selectedClient) return;
  
      setLoadingFacturas(true);
      try {
        console.log("Cargando facturas para el cliente:", selectedClient);
        const res = await dataComprobantePagoFactura(selectedClient);
        console.log("Facturas del cliente:", res);
        const facturas = res.data.map(f => ({
          id: f.factura_id,
          numero: f.facturanumero,
          importe: f.importe,
          cotizacion: f.cotizacion.cotizacion_id,
          cotizacionNumero: f.cotizacion.numero,
          tipoMoneda: f.tipoMoneda.codigo,
          cliente: f.cliente.cliente_id
        }));
        setSubtotal(facturas.importe);
        setTotal(facturas.importe);
        setFacturasPorCliente(facturas); // este lo usas en `obtenerFacturasDisponibles`
        console.log("Facturas filtradas:", facturas);
      } catch (error) {
        console.error("Error al obtener facturas por cliente:", error);
      } finally {
        setLoadingFacturas(false);
      }
    };
  
    fetchFacturasPorCliente();
  }, [selectedClient]);  
  useEffect(() => {
    if (!id || facturasPorCliente.length === 0) return;
  
    // Ejecuta handleSelectChange solo cuando ya hay facturas disponibles
    handleSelectChange(1, parseInt(id));
  }, [id, facturasPorCliente]);
  

  // Cargar formas de pago desde la API
  useEffect(() => {
    const fetchFormasPago = async () => {
      setLoadingFormasPago(true);
      try {
        const response = await getAllFormaPago();
        setFormasPagoData(response.data);
      } catch (error) {
        console.error("Error al obtener formas de pago:", error);
      } finally {
        setLoadingFormasPago(false);
      }
    };
    fetchFormasPago();
  }, []);

  // Función para agregar una nueva factura al arreglo de facturas
  const agregarFactura = () => {
    setFacturas([
      ...facturas,
      {
        id: facturas.length + 1,
        factura: '',
        fechaSolicitada: null,
        formaPago: '',
        precioTotal: '',
        precioPagar: '',
        precioRestante: '',
      },
    ]);
  };
  

  // Función para obtener las facturas disponibles (para evitar duplicados)
  // Ahora se filtra además por cliente, asumiendo que cada factura en facturasData tiene la propiedad "cliente"
  const obtenerFacturasDisponibles = (itemId) => {
    // 1) Obtener IDs de facturas ya seleccionadas (para no duplicarlas).
    const facturasSeleccionadas = facturas
      .filter((f) => f.id !== itemId)
      .map((f) => f.factura);
  
    // 2) Filtrar las facturas ya obtenidas desde dataComprobantePagoFactura
    const disponibles = facturasPorCliente.filter((fd) => {
      if (facturasSeleccionadas.includes(fd.id)) return false;
      if (facturasConMontorestanteCero.includes(fd.id)) return false;
      if (!fd.importe || Number(fd.importe) <= 0) return false;
      return true;
    });
    
  
    return disponibles;
  };
  
  

  // Manejo de cambios en los inputs
  const handleInputChange = (id, field, value) => {
    setFacturas((prev) =>
      prev.map((fact) => {
        if (fact.id === id) {
          const newFact = { ...fact, [field]: value };
  
          if (field === 'precioPagar') {
            const totalNum = Number(newFact.precioTotal) || 0;
            const pagarNum = Number(value) || 0;
            newFact.precioRestante = (totalNum - pagarNum).toFixed(2);
          }
  
          return newFact;
        }
        return fact;
      })
    );
  };
  
  const fetchNombreClientePorFactura = async (facturaId) => {
    try {
      const res = await dataComprobantePago(facturaId);
      if (res && res.data && res.data.nombreCompleto) {
        setClientesFactura((prev) => ({
          ...prev,
          [facturaId]: res.data.nombreCompleto,
        }));
      }
    } catch (err) {
      console.error(`Error al obtener cliente de la factura ${facturaId}:`, err);
    }
  };
  

  const [form] = Form.useForm();

  // ✅ Función para crear el comprobante de pago
  const handleCrearPagos = async () => {
      // Validar que para cada factura el precio a pagar no sea mayor al precio total
  for (const facturaItem of facturas) {
    if (Number(facturaItem.precioPagar) > Number(facturaItem.precioTotal)) {
      message.error("El precio a pagar no puede ser mayor al precio total");
      return; // Se interrumpe la función sin enviar el formulario
    }
  }
    try {
      // 1) Obtener observaciones y fecha
      const observaciones = form.getFieldValue("Notas") || "";
      const fechaPago = fechaSolicitada
        ? fechaSolicitada.format("YYYY-MM-DD HH:mm:ss")
        : null;
  
      // 2) Construir ComprobantePago usando las variables globales
      const dataComprobantePago = {
        observaciones,
        fechaPago,
        formapago: formaPagoGlobal,     // <-- del estado global
      };
  
      // 3) Crear ComprobantePago
      const respComprobante = await createComprobantepago(dataComprobantePago);
      const comprobantepagoId = respComprobante.data.id;
  
      // 4) Para cada factura, crear ComprobantePagoFactura
    // 4) Crear ComprobantePagoFactura para **cada** factura del array
    for (const facturaItem of facturas) { 
      // Omitir si no seleccionó ninguna factura
      if (!facturaItem.factura) continue; 

      const dataComprobanteFactura = {
        montototal: Number(facturaItem.precioTotal) || 0,
        montorestante: Number(facturaItem.precioRestante) || 0,
        montopago: Number(facturaItem.precioPagar) || 0,
        comprobantepago: comprobantepagoId,
        factura: facturaItem.factura,
      };
      await createComprobantepagoFactura(dataComprobanteFactura);
    }
  
    message.success("¡Comprobante de pago creado con éxito!");
    setIsModalVisible(true); // Mostrar el modal cuando el pago se registra correctamente
  } catch (error) {
    console.error("Error en crear pagos:", error);
    message.error("Error al crear el comprobante de pago");
  }
};
const handleModalOk = () => {
  setIsModalVisible(false); // Ocultar el modal
  navigate('/Pagos/'); // Redirigir a la pantalla /Pagos/
};
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [, setDescuento] = useState(0);  // Descuento en %
  const [, setIva] = useState(0);             // IVA en %
  //const [servicios, setServicios] = useState([]); // Lista de cotizacionServicio filtrados
  const [, setSubtotal] = useState(0);
  const [, setTotal] = useState(0);

  useEffect(() => {
    if (!cotizacionId) return; // Si no hay cotizacionId, no hacemos nada
  
    const fetchCotiData = async () => {
      try {
        //console.log('cotizacionId: ',cotizacionId);
        // 1) Obtener la cotización
        const cotiRes = await getCotizacionById(cotizacionId);
        const coti = cotiRes.data;
        setDescuento(coti.descuento);
  
        // 2) Obtener el porcentaje de IVA usando el id que viene en coti.iva
        const ivaRes = await getIvaById(coti.iva);
        // Supongamos que la respuesta tiene la propiedad "porcentaje"
        const ivaPercentage = ivaRes.data.porcentaje;
        setIva(ivaPercentage);
  
        // 3) Obtener todos los servicios de la cotización
        const cotiServRes = await getAllCotizacionServicio();
        const serviciosFiltrados = cotiServRes.data.filter(
          (item) => item.cotizacion === Number(cotizacionId)
        );
  
        // 4) Calcular el subtotal
        const nuevoSubtotal = facturasPorCliente.importe;
  
        // 5) Calcular descuento, IVA y total usando el porcentaje obtenido
        const montoDescuento = nuevoSubtotal * (coti.descuento / 100);
        const subtotalConDesc = nuevoSubtotal - montoDescuento;
        const montoIva = subtotalConDesc * (ivaPercentage);
        const montoTotal = facturasPorCliente.importe;
  
        // 6) Guardar en el estado
        setSubtotal(nuevoSubtotal);
        setTotal(montoTotal);
  
      } catch (error) {
        console.error("Error al obtener datos de la cotización:", error);
      }
    };
  
    fetchCotiData();
  }, [cotizacionId]);

  // Manejo de cambio en el select de factura
  const handleSelectChange = async (facturaItemId, selectedFacturaId) => {
    // 1) Actualiza la factura seleccionada
    fetchNombreClientePorFactura(selectedFacturaId);
  
    setFacturas((prev) =>
      prev.map((fact) =>
        fact.id === facturaItemId
          ? { ...fact, factura: selectedFacturaId }
          : fact
      )
    );
  
    // 2) Ajusta cotizacionId si lo necesitas
    const selectedFacturaObj = facturasPorCliente.find((fd) => fd.id === selectedFacturaId);
    if (selectedFacturaObj) {
      setcotizacionId(selectedFacturaObj.cotizacion);
    }
  
    try {
      const response = await getAllComprobantepagoFactura();
  
      const comprobantesFactura = response.data.filter(
        (cf) => cf.factura === selectedFacturaId
      );
  
      const invoiceObj = facturasPorCliente.find((f) => f.id === selectedFacturaId);
  
      if (comprobantesFactura.length > 0) {
        // Si hay registros de pagos, tomamos el montorestante más reciente
        const recordConParcialidadMaxima = comprobantesFactura.reduce((acc, curr) =>
          curr.parcialidad > acc.parcialidad ? curr : acc
        );
  
        const montorestante = recordConParcialidadMaxima.montorestante;
  
        setFacturas((prev) =>
          prev.map((fact) => {
            if (fact.id === facturaItemId) {
              return {
                ...fact,
                precioTotal: montorestante.toString(),
                tipoMoneda: invoiceObj?.tipoMoneda || '',
                precioPagar: montorestante.toString(), // Autocompletar precio a pagar
                precioRestante: '0.00',                // Automáticamente 0
              };
            }
            return fact;
          })
        );
      } else {
        // Si no hay pagos previos, usamos el importe completo
        setFacturas((prev) =>
          prev.map((fact) => {
            if (fact.id === facturaItemId) {
              return {
                ...fact,
                precioTotal: invoiceObj?.importe || '',
                tipoMoneda: invoiceObj?.tipoMoneda || '',
                precioPagar: invoiceObj?.importe || '',      // Autocompletar precio a pagar
                precioRestante: '0.00',
              };
            }
            return fact;
          })
        );
      }
    } catch (err) {
      console.error('Error obteniendo ComprobantePagoFactura:', err);
    }
  };

  
const handleRemoveConcepto = (facturaId, e) => {
  // Si el checkbox está marcado:
  if (e.target.checked) {
    setFacturas((prevFacturas) => {
      // Si solo queda 1 factura, no se elimina
      if (prevFacturas.length <= 1) {
        message.warning("No puedes eliminar la última factura.");
        return prevFacturas;
      }
      // De lo contrario, filtra la que se quiere eliminar
      return prevFacturas.filter((fact) => fact.id !== facturaId);
    });
  }
};

  

  return (
    <div style={{
      textAlign: 'center',
      marginTop: 40,
      backgroundColor: '#f0f9ff', // Un tono muy claro de azul para el fondo general
      minHeight: '100vh',         // Para ocupar toda la pantalla
      paddingTop: 20
    }}>
      <h1 style={{ color: '#1890ff', marginBottom: 30 }}>Creación de Pagos</h1>

      {/* Selector de Cliente */}
      <div style={{ marginBottom: 20 }}>
        <Select
          placeholder="Cliente"
          style={{ width: 200 }}
          loading={loadingClientes}
          onChange={(value) => setSelectedClient(value)}
          value={selectedClient || undefined}
          dropdownStyle={{ borderRadius: 8 }} // Estilo para el menú desplegable
        >
          {clientesData.map((cliente) => (
            <Option key={cliente.cliente_id} value={cliente.cliente_id}>
              {cliente.nombreCompleto} 
            </Option>
          ))}
        </Select>
      </div>

      {/* Contenedor principal */}
      <Card
        style={{
          width: '90%',
          maxWidth: '1200px',  // Pero no excederá 1200px
          margin: '0 auto',
          textAlign: 'left',
          borderRadius: 8,
          padding: 20,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Sombra sutil
          border: '1px solid #e6f7ff'
        }}
      >
        <Form layout="vertical" form={form}>
          {/* Campos globales (fuera del map) */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Fecha y hora solicitada"
                rules={[{ required: true, message: 'Por favor ingresa la fecha y hora.' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  value={fechaSolicitada}
                  onChange={(date) => setFechaSolicitada(date)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
            <Form.Item label="Forma de pago">
              <Select
                placeholder="Selecciona la forma de pago"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "").toLowerCase().localeCompare(
                    (optionB?.label ?? "").toLowerCase()
                  )
                }
                value={formaPagoGlobal || undefined}
                onChange={(value) => setFormaPagoGlobal(value)}
                loading={loadingFormasPago}
                dropdownStyle={{ borderRadius: 8 }}
              >
                {formasPagoData.map((fp) => (
                  <Option
                    key={fp.id}
                    value={fp.id}
                    label={`${fp.codigo} - ${fp.descripcion}`}
                  >
                    {`${fp.codigo} - ${fp.descripcion}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            </Col>
          </Row>
          {facturas.map((factura, index) => (
            <Card
              key={factura.id}
              title={`Factura ${factura.id}`}
              style={{
                marginBottom: 16,
                borderRadius: 8,
                padding: 20,
                backgroundColor: '#fafafa',
                border: '1px solid #d9f7be'
              }}
              headStyle={{
                backgroundColor: '#e6f7ff', // Encabezado con un tono de azul
                borderRadius: '8px 8px 0 0'
              }}
            >
            <Row justify="end">
              <div>
                <Checkbox onChange={(e) => handleRemoveConcepto(factura.id,e)}>
                  Eliminar
                </Checkbox>
              </div>
            </Row>
              <Row gutter={16}>
                <Col span={24}>
                <Form.Item label="Factura">
                <Select
                  placeholder="Selecciona una factura"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "").toLowerCase().localeCompare(
                      (optionB?.label ?? "").toLowerCase()
                    )
                  }
                  value={factura.factura || undefined}
                  onChange={(value) => handleSelectChange(factura.id, value)}
                  loading={loadingFacturas}
                  dropdownStyle={{ borderRadius: 8 }}
                >
                {obtenerFacturasDisponibles(factura.id).map((f) => {
                  const nombreCliente = clientesFactura[f.id]; // busca si ya está
                  const label = nombreCliente
                    ? `Factura ${f.numero} - cotizacion ${f.cotizacionNumero} - ${nombreCliente}`
                    : `Factura ${f.numero} - cotizacion ${f.cotizacionNumero}`;
                  
                  return (
                    <Select.Option
                      key={f.id}
                      value={f.id}
                      label={label}
                    >
                      {label}
                    </Select.Option>
                  );
                })}

                </Select>
              </Form.Item>

                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Precio total">
                    <Input
                      value={factura.precioTotal}
                      onChange={(e) =>
                        handleInputChange(factura.id, 'precioTotal', e.target.value)
                      }
                      style={{ borderRadius: 8 }}
                      disabled={true}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                <Form.Item label="Moneda">
                  <Input
                    value={factura.tipoMoneda || ""}
                    disabled
                  />
                </Form.Item>
              </Col>
              </Row>
              <Col span={12}>
                  <Form.Item label="Precios a pagar">
                    <Input
                      max={factura.precioTotal}
                      min={1}

                      value={factura.precioPagar}
                      onChange={(e) =>
                        handleInputChange(factura.id, 'precioPagar', e.target.value)
                      }
                      style={{ borderRadius: 8 }}
                      
                    />
                  </Form.Item>
                </Col>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Precio restante">
                    <Input
                      type="number"
                      value={factura.precioRestante}
                      onChange={(e) =>
                        handleInputChange(factura.id, 'precioRestante', e.target.value)
                      }
                      style={{ borderRadius: 8 }}
                      disabled={true}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {/* Espacio para más campos si es necesario */}
                </Col>
              </Row>
              
            </Card>
          ))}

          {/* Notas generales */}
          <Form.Item
            label="Notas"
            name="Notas"
            rules={[{ required: true, message: 'Por favor ingresa la descripción.' }]}
          >
            <TextArea
              placeholder="Notas que aparecerán al final de la cotización (Opcional)"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* Botones */}
      <div style={{ marginTop: 20 }}>
        <Button
          onClick={agregarFactura}
          style={{
            marginRight: 10,
            backgroundColor: '#bae7ff',
            borderColor: '#91d5ff',
            color: '#096dd9',
            borderRadius: 8
          }}
        >
          Agregar factura
        </Button>
        <Button
          type="primary"
          style={{
            backgroundColor: '#52c41a',
            borderColor: '#52c41a',
            borderRadius: 8
          }}
          onClick={handleCrearPagos} 
        >
          Crear pagos
        </Button>
        <Modal
        title="Pago Registrado"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalOk} // También redirigir si el usuario cierra el modal
        okText="Aceptar"
        cancelText="Cerrar"
      >
        <p>El pago se ha registrado correctamente.</p>
      </Modal>
      </div>
    </div>
  );
};

export default CrearPagos;
