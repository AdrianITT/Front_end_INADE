import React, { useState, useEffect, useMemo } from 'react';
import { Card, Select, Input, Button, Row, Col, Form, DatePicker, message } from 'antd';
import { useParams} from "react-router-dom";
import { getAllFactura } from '../../apis/FacturaApi';
import { getAllFormaPago } from '../../apis/FormaPagoApi';
import { getAllEmpresas } from '../../apis/EmpresaApi';
import { getAllCliente } from '../../apis/ClienteApi';
import { getAllCotizacion, getCotizacionById} from '../../apis/CotizacionApi';
import { getAllCotizacionServicio } from '../../apis/CotizacionServicioApi';
import { getAllOrdenesTrabajo } from '../../apis/OrdenTrabajoApi';
import { createComprobantepago } from '../../apis/PagosApi';

const { Option } = Select;
const { TextArea } = Input;

const CrearPagos = () => {
  const [cotizacionId, setcotizacionId]=useState();
  const { id } = useParams();
  // Estado para clientes (API)w
  const [clientesData, setClientesData] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estado para facturas (API)
  const [facturasData, setFacturasData] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);

  // Estado para formas de pago (API)
  const [formasPagoData, setFormasPagoData] = useState([]);
  const [loadingFormasPago, setLoadingFormasPago] = useState(false);

  // Obtener el ID de la organización (se hace una sola vez)
  const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

  // Estado para el cliente seleccionado
  const [selectedClient, setSelectedClient] = useState(null);

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

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClientes = async () => {
      setLoadingClientes(true);
      try {
        const response = await getAllCliente();
        setClientesData(response.data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoadingClientes(false);
      }
    };
    fetchClientes();
  }, []);

  //filtra por id de factura
  useEffect(() => {
    if (id) {
      const fetchClienteFromFactura = async () => {
        try {
          const [cotizacionesRes, ordenesRes, facturasRes] = await Promise.all([
            getAllCotizacion(),
            getAllOrdenesTrabajo(),
            getAllFactura(),
          ]);
  
          // Buscar la factura con ese id
          const facturaFound = facturasRes.data.find(fact => fact.id === parseInt(id));
          if (facturaFound) {
            // Buscar la orden de trabajo asociada a la factura
            const orden = ordenesRes.data.find(o => o.id === facturaFound.ordenTrabajo);
            if (orden) {
              // Buscar la cotización asociada a la orden de trabajo
              const cotizacion = cotizacionesRes.data.find(c => c.id === orden.cotizacion);
              console.log('cotizaciones: ', cotizacion);
              if (cotizacion) {
                // Actualizamos el cliente seleccionado
                setSelectedClient(cotizacion.cliente);
                // Preseleccionar la factura en el formulario (por ejemplo, en el primer item)
                setFacturas(prev => {
                  // Actualiza el primer item para que su propiedad "factura" sea el id encontrado
                  if (prev.length > 0) {
                    return prev.map((item, index) =>
                      index === 0 ? { ...item, factura: facturaFound.id } : item
                    );
                  }
                  return prev;
                });
              }
            }
          }
        } catch (error) {
          console.error("Error al obtener cliente a partir de factura:", error);
        }
      };
      fetchClienteFromFactura();
    }
  }, [id]);
  

  // Cargar facturas filtradas por organización y cliente
  useEffect(() => {
    const fetchFacturasFiltradas = async () => {
      setLoadingFacturas(true);
      try {
        const [empresasRes, clientesRes, cotizacionesRes, ordenesRes, facturasRes] = await Promise.all([
          getAllEmpresas(),
          getAllCliente(),
          getAllCotizacion(),
          getAllOrdenesTrabajo(),
          getAllFactura(),
        ]);

        // Filtrar empresas por organizationId
        const empresasFiltradas = empresasRes.data.filter(emp => emp.organizacion === organizationId);
        const empresaIds = empresasFiltradas.map(emp => emp.id);

        // Filtrar clientes cuyos "empresa" estén en empresaIds
        const clientesFiltrados = clientesRes.data.filter(cliente => empresaIds.includes(cliente.empresa));
        const clienteIds = clientesFiltrados.map(cliente => cliente.id);

        // Filtrar cotizaciones cuyos "cliente" estén en clienteIds
        const cotizacionesFiltradas = cotizacionesRes.data.filter(cot => clienteIds.includes(cot.cliente));
        const cotizacionIds = cotizacionesFiltradas.map(cot => cot.id);
        console.log('cotizacionesFiltradas: ', cotizacionesFiltradas);
        console.log('cotizacionIds: ', cotizacionIds)
        setcotizacionId(cotizacionIds);

        // Filtrar órdenes de trabajo cuyos "cotizacion" estén en cotizacionIds
        const ordenesFiltradas = ordenesRes.data.filter(orden => cotizacionIds.includes(orden.cotizacion));
        const ordenIds = ordenesFiltradas.map(orden => orden.id);
        

        // Filtrar facturas cuyos "ordenTrabajo" estén en ordenIds
        const facturasFiltradas = facturasRes.data.filter(factura => ordenIds.includes(factura.ordenTrabajo));
        console.log('Facturas filtradas (sin filtro de cliente):', facturasFiltradas);

                // Después de filtrar las facturas base:
        let facturasEnriquecidas = facturasFiltradas.map(fact => {
          // 1) Buscar la orden de trabajo correspondiente
          const orden = ordenesFiltradas.find(o => o.id === fact.ordenTrabajo);
          // 2) Buscar la cotización correspondiente
          const coti = cotizacionesFiltradas.find(c => c.id === orden.cotizacion);
          // 3) Ese coti.cliente es el ID del cliente
          return {
            ...fact,
            cliente: coti?.cliente, // <-- ahora cada factura tendrá .cliente
            cotizacion: coti?.id,
          };
        });

        console.log('Facturas con cliente:', facturasEnriquecidas);

        // Filtramos por selectedClient
        const facturasDelCliente = selectedClient
          ? facturasEnriquecidas.filter(f => Number(f.cliente) === Number(selectedClient))
          : facturasEnriquecidas;
        console.log('Selected Client:', selectedClient);
        console.log('Facturas filtradas para el cliente:', facturasDelCliente);

        setFacturasData(facturasDelCliente);
      } catch (error) {
        console.error("Error al filtrar facturas:", error);
      } finally {
        setLoadingFacturas(false);
      }
    };

    // Si se seleccionó un cliente, se puede filtrar facturas relacionadas a ese cliente.
    // Puedes llamar a esta función cada vez que cambie el cliente seleccionado.
    if (selectedClient) {
      fetchFacturasFiltradas();
    }
  }, [organizationId, selectedClient]);

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
    const facturasSeleccionadas = facturas
      .filter((f) => f.id !== itemId)
      .map((f) => f.factura);
    return facturasData.filter((fd) =>
      !facturasSeleccionadas.includes(fd.id) && fd.cliente === selectedClient
    );
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
            newFact.precioRestante = (totalNum - pagarNum).toString();
          }
  
          return newFact;
        }
        return fact;
      })
    );
  };
  

// Manejo de cambio en el select de factura
const handleSelectChange = (facturaItemId, selectedFacturaId) => {
  // 1) Actualiza la factura en "facturas"
  setFacturas(prev =>
    prev.map(fact =>
      fact.id === facturaItemId
        ? { ...fact, factura: selectedFacturaId }
        : fact
    )
  );
  // 2) Busca la factura en facturasData
  const selectedFacturaObj = facturasData.find(fd => fd.id === selectedFacturaId);
  if (selectedFacturaObj) {
    // 3) setcotizacionId con el ID único
    setcotizacionId(selectedFacturaObj.cotizacion); // <--- debe ser un número
    console.log("Cotizacion ID directo de la factura:", selectedFacturaObj.cotizacion);
  }
};

  // Manejo de cambio en el select de forma de pago
  const handleFormaPagoChange = (id, value) => {
    setFacturas(prev =>
      prev.map(fact => (fact.id === id ? { ...fact, formaPago: value } : fact))
    );
  };

  // Manejo de cambio de fecha
  const handleFechaChange = (id, date) => {
    setFacturas(prev =>
      prev.map(fact => (fact.id === id ? { ...fact, fechaSolicitada: date } : fact))
    );
  };

  const [form] = Form.useForm();

  // ✅ Función para crear el comprobante de pago
  const handleCrearPagos = async () => {
    try {
    // Suponiendo que tu backend NO maneja un array "detalles",
    // sino un objeto plano con campos directos:
    const dataParaBackend = {
      // 'observaciones' en vez de 'notas'
      observaciones: form.getFieldValue('Notas') || '',

      // 'fechaPago' en vez de 'fecha'
      fechaPago: facturas[0].fechaSolicitada
        ? facturas[0].fechaSolicitada.format('YYYY-MM-DD')
        : null,

      // 'facturaId' en vez de 'factura'
      facturaId: facturas[0].factura,

      // 'formaPago' ya coincide, por ejemplo
      formaPago: facturas[0].formaPago,

      // si tu backend pide 'metodoPago', agrégalo
      metodoPago: 1,

      // si tu backend espera 'precioTotal', 'precioPagar', 'precioRestante' directamente
      precioTotal: facturas[0].precioTotal,
      precioPagar: facturas[0].precioPagar,
      precioRestante: facturas[0].precioRestante,
    };

    console.log("Data que envío al backend:", dataParaBackend);
    const response = await createComprobantepago(dataParaBackend);
    console.log("Respuesta del backend:", response);
      // 4) Manejar la respuesta (puedes usar message de AntD para feedback)
      message.success('¡Comprobante de pago creado con éxito!');
      // Opcional: Redirigir o limpiar el formulario
    } catch (error) {
      console.error('Error al crear comprobante de pago:', error);
      message.error('Error al crear comprobante de pago');
    }
  };

  const [descuento, setDescuento] = useState(0);  // Descuento en %
  const [iva, setIva] = useState(0);             // IVA en %
  const [servicios, setServicios] = useState([]); // Lista de cotizacionServicio filtrados
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!cotizacionId) return; // Si no hay cotizacionId, no hacemos nada
  
    const fetchCotiData = async () => {
      try {
        // 1) Obtener la cotización
        const cotiRes = await getCotizacionById(cotizacionId);
        const coti = cotiRes.data;
        // coti.descuento y coti.iva
        setDescuento(coti.descuento);
        setIva(coti.iva);
  
        // 2) Obtener todos los cotizacionServicio
        const cotiServRes = await getAllCotizacionServicio();
        // Filtrar los que correspondan a esta cotización
        const serviciosFiltrados = cotiServRes.data.filter(
          (item) => item.cotizacion === Number(cotizacionId)
        );
  
        // 3) Calcular el subtotal
        const nuevoSubtotal = serviciosFiltrados.reduce(
          (acc, item) => acc + (Number(item.precio) * Number(item.cantidad)),
          0
        );
  
        // 4) Aplicar descuento e IVA (suponiendo coti.descuento=5 => 5%)
        const montoDescuento = nuevoSubtotal * (coti.descuento / 100);
        const subtotalConDesc = nuevoSubtotal - montoDescuento;
        const montoIva = subtotalConDesc * (coti.iva / 100);
        const montoTotal = subtotalConDesc + montoIva;
  
        // 5) Guardar en tu estado
        setSubtotal(nuevoSubtotal);
        setTotal(montoTotal);
  
        // 6) (Opcional) Asignar el total a la primera factura del formulario
        setFacturas(prev => prev.map((fact, index) =>
          index === 0 
            ? { ...fact, precioTotal: montoTotal.toFixed(2) } 
            : fact
        ));
  
        console.log("Descuento:", coti.descuento, "IVA:", coti.iva);
        console.log("Subtotal:", nuevoSubtotal, "Total:", montoTotal);
      } catch (error) {
        console.error("Error al obtener datos de la cotización:", error);
      }
    };
  
    fetchCotiData();
  }, [cotizacionId]);
  

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
            <Option key={cliente.id} value={cliente.id}>
              {cliente.nombrePila} {cliente.apPaterno} {cliente.apMaterno}
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
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Factura">
                    <Select
                      placeholder="Selecciona una factura"
                      value={factura.factura || undefined}
                      onChange={(value) => handleSelectChange(factura.id, value)}
                      loading={loadingFacturas}
                      dropdownStyle={{ borderRadius: 8 }}
                    >
                      {obtenerFacturasDisponibles(factura.id).map((f) => (
                        <Option key={f.id} value={f.id}>
                          {`Factura ${f.id}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Fecha Solicitada */}
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Fecha Solicitada" rules={[{ required: true, message: 'Por favor ingresa la fecha.' }]}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                      value={factura.fechaSolicitada}
                      onChange={(date) => handleFechaChange(factura.id, date)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Select: Forma de Pago */}
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Forma de pago">
                    <Select
                      placeholder="Selecciona la forma de pago"
                      value={factura.formaPago || undefined}
                      onChange={(value) => handleFormaPagoChange(factura.id, value)}
                      loading={loadingFormasPago}
                      dropdownStyle={{ borderRadius: 8 }}
                    >
                      {formasPagoData.map((fp) => (
                        <Option key={fp.id} value={fp.id}>
                          {`${fp.codigo} - ${fp.descripcion}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Precio total">
                    <Input
                      type="number"
                      value={factura.precioTotal}
                      onChange={(e) =>
                        handleInputChange(factura.id, 'precioTotal', e.target.value)
                      }
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Precios a pagar">
                    <Input
                      type="number"
                      value={factura.precioPagar}
                      onChange={(e) =>
                        handleInputChange(factura.id, 'precioPagar', e.target.value)
                      }
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

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
      </div>
    </div>
  );
};

export default CrearPagos;
