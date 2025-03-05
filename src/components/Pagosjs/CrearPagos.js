import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Select, Input, Button, Row, Col, Form, DatePicker, message, Modal, Checkbox } from 'antd';
import { getAllFactura } from '../../apis/FacturaApi';
import { getAllFormaPago } from '../../apis/FormaPagoApi';
import { getAllEmpresas } from '../../apis/EmpresaApi';
import { getAllCliente } from '../../apis/ClienteApi';
import { getAllCotizacion, getCotizacionById} from '../../apis/CotizacionApi';
import { getAllCotizacionServicio } from '../../apis/CotizacionServicioApi';
import { getAllOrdenesTrabajo } from '../../apis/OrdenTrabajoApi';
import { createComprobantepago } from '../../apis/PagosApi';
import { createComprobantepagoFactura, getAllComprobantepagoFactura } from '../../apis/ComprobantePagoFacturaApi';
import {getAllMetodopago} from '../../apis/MetodoPagoApi';
import { getIvaById } from '../../apis/ivaApi';

const { Option } = Select;
const { TextArea } = Input;

const CrearPagos = () => {
  const navigate = useNavigate();
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

  // Estado para almacenar la lista de métodos de pago
  const [, setMetodosPago] = useState([]);
  // Estado para indicar si se están cargando los métodos
  const [, setLoadingMetodos] = useState(false);

  // Estados globales fuera del array de facturas:
const [fechaSolicitada, setFechaSolicitada] = useState(null);
const [formaPagoGlobal, setFormaPagoGlobal] = useState('');
//const [metodoPagoGlobal, setMetodoPagoGlobal] = useState(null);


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
    const fetchMetodosPago = async () => {
      setLoadingMetodos(true);
      try {
        const response = await getAllMetodopago();
        setMetodosPago(response.data);
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
      } finally {
        setLoadingMetodos(false);
      }
    };
    fetchMetodosPago();
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
              console.log('hola');
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
        const facturasFiltradas = facturasRes.data.filter(factura => ordenIds.includes(factura.ordenTrabajo)&& Number(factura.importe) > 0);
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
            ordenTrabajo: orden,
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
            newFact.precioRestante = (totalNum - pagarNum).toFixed(2);
          }
  
          return newFact;
        }
        return fact;
      })
    );
  };
  



  // Manejo de cambio en el select de forma de pago
  /*
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
  };*/

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
        metodopago: 2,   // <-- del estado global
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
        const nuevoSubtotal = serviciosFiltrados.reduce(
          (acc, item) => acc + (Number(item.precio) * Number(item.cantidad)),
          0
        );
  
        // 5) Calcular descuento, IVA y total usando el porcentaje obtenido
        const montoDescuento = nuevoSubtotal * (coti.descuento / 100);
        const subtotalConDesc = nuevoSubtotal - montoDescuento;
        const montoIva = subtotalConDesc * (ivaPercentage);
        const montoTotal = subtotalConDesc + montoIva;
  
        // 6) Guardar en el estado
        setSubtotal(nuevoSubtotal);
        setTotal(montoTotal);
  
        // 7) (Opcional) Asignar el total a la primera factura del formulario
        /*
        setFacturas((prev) =>
          prev.map((fact, index) =>
            index === 0 ? { ...fact, precioTotal: montoTotal.toFixed(2) } : fact
          )
        );*/
        
  
        console.log("Descuento:", coti.descuento, "IVA:", ivaPercentage);
        console.log("Subtotal:", nuevoSubtotal, "Total:", montoTotal);
      } catch (error) {
        console.error("Error al obtener datos de la cotización:", error);
      }
    };
  
    fetchCotiData();
  }, [cotizacionId]);

  // Manejo de cambio en el select de factura
const handleSelectChange = async (facturaItemId, selectedFacturaId) => {
  // 1) Actualiza la factura seleccionada
  setFacturas((prev) =>
    prev.map((fact) =>
      fact.id === facturaItemId
        ? { ...fact, factura: selectedFacturaId }
        : fact
    )
  );

  // 2) Ajusta cotizacionId si lo necesitas
  const selectedFacturaObj = facturasData.find((fd) => fd.id === selectedFacturaId);
  if (selectedFacturaObj) {
    setcotizacionId(selectedFacturaObj.cotizacion);
  }

  // 3) Traer todos los ComprobantePagoFactura (o filtrar por factura en el backend)
  try {
    const response = await getAllComprobantepagoFactura(); 
    // O si tu backend lo permite:
    // const response = await getComprobantepagoFacturaByFactura(selectedFacturaId);

    // 4) Filtrar por la factura seleccionada
    const comprobantesFactura = response.data.filter(
      (cf) => cf.factura === selectedFacturaId
    );
    console.log('comprobantesFactura: ',comprobantesFactura);
    const invoiceObj = facturasData.find((f) => f.id === selectedFacturaId);
    if (comprobantesFactura.length > 0) {
      // 5) Tomar la parcialidad más alta
      const recordConParcialidadMaxima = comprobantesFactura.reduce((acc, curr) =>
        curr.parcialidad > acc.parcialidad ? curr : acc
      );

      // 6) Usar su `montorestante` como "precioTotal"
      const montorestante = recordConParcialidadMaxima.montorestante;

      setFacturas((prev) =>
        prev.map((fact) => {
          if (fact.id === facturaItemId) {
            return { ...fact, precioTotal: montorestante.toString(),
              tipoMoneda: invoiceObj ? invoiceObj.tipoMoneda : '' 
             };
          }
          return fact;
        })
      );
    } else {
      setFacturas((prev) =>
        prev.map((fact) => {
          if (fact.id === facturaItemId) {
            // 1) Busca la factura en el array facturasData
            //const invoiceObj = facturasData.find((f) => f.id === selectedFacturaId);
            if (invoiceObj) {
              // 2) Asigna su 'importe' como precioTotal
              return { ...fact, precioTotal: invoiceObj.importe,tipoMoneda: invoiceObj.tipoMoneda };
            }
            // Si no se encuentra, lo dejas en blanco o como prefieras
            return { ...fact, precioTotal: '', tipoMoneda: ''  };
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
                  value={formaPagoGlobal || undefined}
                  onChange={(value) => setFormaPagoGlobal(value)}
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
                      value={factura.factura || undefined}
                      onChange={(value) => handleSelectChange(factura.id, value)}
                      loading={loadingFacturas}
                      dropdownStyle={{ borderRadius: 8 }}
                    >
                      {obtenerFacturasDisponibles(factura.id).map((f) => (
                        <Option key={f.id} value={f.id}>
                          {`Factura ${f.id}- ${f.ordenTrabajo.codigo}`}
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
                      type="number"
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
