import React, {useState, useEffect} from "react";
import { Form, Input, Button, Select, Row, Col,DatePicker, message, Table } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import "./crearfactura.css";
import { getAllTipoCDFI } from "../../apis/TipoCFDIApi";
import { getAllFormaPago } from "../../apis/FormaPagoApi";
import { getAllMetodopago } from "../../apis/MetodoPagoApi";
import { getAllServicio } from "../../apis/ServiciosApi";
import { getAllOrdenesTrabajoServicio } from "../../apis/OrdenTabajoServiciosApi";
import { getAllCotizacionServicio } from "../../apis/CotizacionServicioApi";
import { getAllEmpresas } from "../../apis/EmpresaApi";
import { getAllOrganizacion } from "../../apis/organizacionapi";
import { getAllCSD } from "../../apis/csdApi";
import { getAllOrdenesTrabajo } from "../../apis/OrdenTrabajoApi";
import { getAllCotizacion } from "../../apis/CotizacionApi";
import { getAllIva } from "../../apis/ivaApi";
import { createFactura } from "../../apis/FacturaApi";
import { getInfoSistema } from "../../apis/InfoSistemaApi";
import { getOrdenTrabajoById } from "../../apis/OrdenTrabajoApi";
import { getCotizacionById } from "../../apis/CotizacionApi";
import { getTipoMonedaById } from "../../apis/Moneda";

const { TextArea } = Input;
const { Option } = Select;

const CrearFactura = () => {
    const [form] = Form.useForm();
    const { id } = useParams();
    const [tipoCambioDolar, setTipoCambioDolar] = useState(0);
    const userOrganizationId = localStorage.getItem("organizacion_id"); // 

    // Estados para almacenar los datos de las APIs
    const [usoCfdiList, setUsoCfdiList] = useState([]);
    const [formaPagoList, setFormaPagoList] = useState([]);
    const [metodoPagoList, setMetodoPagoList] = useState([]);
    const [serviciosList, setServiciosList] = useState([]);
    const [ordenTrabajoServicios, setOrdenTrabajoServicios] = useState([]);
    const [organizacion, setOrganizacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState(null);
    const [rfcEmisor, setRfcEmisor] = useState(null);
    const [codigoOrden, setCodigoOrden] = useState(null);
    const [ivaId, setIvaId] = useState(1);
    const navigate = useNavigate();
    const [moneda, setMoneda] = useState({ codigo: "", descripcion: "" });
    const [cotizacionId, setCotizacionId] = useState(null);


    // Estados
    const [tasaIva, setTasaIva] = useState(8);
    const [subtotal, setSubtotal] = useState(0);
    const [iva, setIva] = useState(0);
    const [total, setTotal] = useState(0);

    const esUSD =moneda.codigo === "USD";
    const factorConversion = esUSD ? tipoCambioDolar : 1;

    // Cargar datos al montar el componente
    useEffect(() => {
        obtenerUsoCfdi();
        obtenerFormaPago();
        obtenerMetodoPago();
        obtenerServicios();
        obtenerOrdenTrabajoServicios();
        obtenerEmpresaPorOrganizacion();
        obtenerOrganizacion();
        obtenerRFCEmisor();
        obtenerCodigoOrdenTrabajo();
        fetchTipoCambio();
        fetchMonedaInfo(id);
    }, [id]);

    useEffect(() => {
      if (ordenTrabajoServicios.length > 0) {
          calcularTotales();
      }
  }, [ordenTrabajoServicios, tasaIva]);

  const fetchMonedaInfo = async (ordenTrabajoId) => {
        try {
          const ordenTrabajo = await getOrdenTrabajoById(ordenTrabajoId);
          console.log("Orden de trabajo:", ordenTrabajo.data);
          const cotizacion = await getCotizacionById(ordenTrabajo.data.cotizacion);
          console.log("Cotización:", cotizacion.data);
          const tipoMoneda = await getTipoMonedaById(cotizacion.data.tipoMoneda);
          console.log("Tipo de moneda:", tipoMoneda.data);
          setMoneda({ codigo: tipoMoneda.data.codigo, descripcion: tipoMoneda.data.descripcion });
      
        } catch (error) {
          console.error("Error al obtener la información de la moneda:", error);
        }
      };
  
  const fetchTipoCambio = async () => {
        try {
          const response = await getInfoSistema();
          const tipoCambio = parseFloat(response.data[0].tipoCambioDolar);
          setTipoCambioDolar(tipoCambio);
        } catch (error) {
          console.error("Error al obtener el tipo de cambio del dólar", error);
        }
      };


      const obtenerCodigoOrdenTrabajo = async () => {
        try {
          const response = await getAllOrdenesTrabajo();
          // Buscar la orden con el ID recibido en la URL
          const ordenEncontrada = response.data.find((orden) => orden.id === parseInt(id));
      
          if (ordenEncontrada) {
            setCodigoOrden(ordenEncontrada.codigo);
            fetchMonedaInfo(ordenEncontrada.id);
            if (ordenEncontrada.cotizacion) {
              setCotizacionId(ordenEncontrada.cotizacion);
              obtenerCotizacion(ordenEncontrada.cotizacion); // Para obtener IVA, etc.
              // Llamar a la función que obtiene los servicios usando cotizacionId
              obtenerOrdenTrabajoServicios(ordenEncontrada.cotizacion);
            }
          } else {
            console.error("Orden de trabajo no encontrada");
          }
        } catch (error) {
          console.error("Error al obtener la orden de trabajo:", error);
        } finally {
          setLoading(false);
        }
      };
      

  // Función para calcular Subtotal, IVA y Total
  const calcularTotales = () => {
    const nuevoSubtotal = ordenTrabajoServicios.reduce(
      (acc, servicio) => acc + servicio.cantidad * servicio.precio,
      0
    );
    const nuevoIva = nuevoSubtotal * tasaIva;
    const nuevoTotal = nuevoSubtotal + nuevoIva;
  
    setSubtotal(nuevoSubtotal.toFixed(2));
    setIva(nuevoIva.toFixed(2));
    setTotal(nuevoTotal.toFixed(2));
  
    // Actualizar valores en el formulario
    form.setFieldsValue({
      subtotal: `$${(nuevoSubtotal / factorConversion).toFixed(2)} ${esUSD ? "USD" : "MXN"}`,
      iva: `$${(nuevoIva / factorConversion).toFixed(2)} ${esUSD ? "USD" : "MXN"}`,
      total: `$${(nuevoTotal / factorConversion).toFixed(2)} ${esUSD ? "USD" : "MXN"}`,
    });
  };
  

    // Función para obtener la organización (Emisor)
    const obtenerOrganizacion = async () => {
      try {
          const response = await getAllOrganizacion();
          const organizacionFiltrada = response.data.find(org => org.id === parseInt(userOrganizationId));

          if (organizacionFiltrada) {
              setOrganizacion(organizacionFiltrada);
          }
      } catch (error) {
          console.error("Error al obtener los datos de la organización", error);
          message.error("Error al obtener los datos de la organización.");
      }
  };

    // Función para obtener Uso CFDI
    const obtenerUsoCfdi = async () => {
      try {
          const response = await getAllTipoCDFI();
          setUsoCfdiList(response.data);
      } catch (error) {
          console.error("Error al obtener Tipo CFDI", error);
          message.error("Error al obtener Tipo CFDI.");
      }
  };

  // Obtener RFC del emisor desde el certificado CSD
  const obtenerRFCEmisor = async () => {
    try {
        const response = await getAllCSD();
        const certificado = response.data.find(csd => csd.Organizacion === parseInt(userOrganizationId));
        if (certificado) {
            setRfcEmisor(certificado.rfc); // Guardamos el RFC del certificado
        }
        } catch (error) {
            console.error("Error al obtener el RFC del certificado", error);
            message.error("Error al obtener el RFC del emisor.");
        }
    };

   // Función para obtener la empresa de la organización
   const obtenerEmpresaPorOrganizacion = async () => {
    try {
        const response = await getAllEmpresas();
        const empresaFiltrada = response.data.find(emp => emp.organizacion === parseInt(userOrganizationId));

        if (empresaFiltrada) {
            setEmpresa(empresaFiltrada);
        }
        } catch (error) {
            console.error("Error al obtener los datos de la empresa", error);
            message.error("Error al obtener los datos de la empresa.");
        }
    };

  // Función para obtener Forma de Pago
  const obtenerFormaPago = async () => {
      try {
          const response = await getAllFormaPago();
          setFormaPagoList(response.data);
      } catch (error) {
          console.error("Error al obtener Forma de Pago", error);
          message.error("Error al obtener Forma de Pago.");
      }
  };

  // Función para obtener Método de Pago
  const obtenerMetodoPago = async () => {
      try {
          const response = await getAllMetodopago();
          setMetodoPagoList(response.data);
      } catch (error) {
          console.error("Error al obtener Método de Pago", error);
          message.error("Error al obtener Método de Pago.");
      }
  };

  // Función para obtener los Servicios de la Orden de Trabajo
  const obtenerServicios = async () => {
      try {
          const response = await getAllServicio();
          setServiciosList(response.data);
          console.log("Servicios:", response.data);
      } catch (error) {
          console.error("Error al obtener los Servicios", error);
          message.error("Error al obtener los Servicios.");
      }
  };

  // Función para obtener los Servicios de la Orden de Trabajo
  const obtenerOrdenTrabajoServicios = async (cotizacionId) => {
    try {
      // Obtener los servicios asociados a la orden de trabajo (tabla core_ordenestrabajosservicios)
      const responseOrdenTrabajo = await getAllOrdenesTrabajoServicio();
      const ordenServicios = responseOrdenTrabajo.data.filter(
        (serv) => serv.ordenTrabajo === parseInt(id)
      );
      
      // Obtener los servicios de la cotización (tabla core_cotizacionservicio)
      const responseCotizacionServicio = await getAllCotizacionServicio();
      const cotizacionServiciosFiltrados = responseCotizacionServicio.data.filter(
        (cotiServ) => cotiServ.cotizacion === cotizacionId
      );
      // 🟢 Asegurar que `serviciosList` tenga datos antes de usarlo
      let listaServicios = serviciosList;
      if (listaServicios.length === 0) {
          const responseServicios = await getAllServicio();
          listaServicios = responseServicios.data;
          setServiciosList(responseServicios.data); // Guardar en el estado
      }

      // 🟢 Combinar información: Agregar `nombreServicio` correctamente
      const serviciosRelacionados = ordenServicios.map((servicio) => {
          const cotizacionServicio = cotizacionServiciosFiltrados.find(
              (cotiServ) => cotiServ.servicio === servicio.servicio
          );

          const servicioInfo = listaServicios.find((s) => s.id === servicio.servicio);

          return {
              ...servicio,
              precio: cotizacionServicio ? cotizacionServicio.precio : servicio.precio,
              nombreServicio: servicioInfo ? servicioInfo.nombreServicio : "Sin nombre",
          };
      });
      
      setOrdenTrabajoServicios(serviciosRelacionados);
    } catch (error) {
      console.error("Error al obtener los servicios de la orden de trabajo", error);
      message.error("Error al obtener los servicios.");
    }
  };
  

// **Obtener el ID del IVA desde la cotización**
const obtenerCotizacion = async (cotizacionId) => {
  try {
    
      const response = await getAllCotizacion();
      const cotizacion = response.data.find(coti => coti.id === cotizacionId);
      if (cotizacion) {
          setIvaId(cotizacion.iva);  // Guardar el ID de IVA
          obtenerIva(cotizacion.iva); // Obtener el porcentaje de IVA

      }
  } catch (error) {
      console.error("Error al obtener la cotización:", error);
  }
};

// **Obtener el porcentaje de IVA desde la API**
const obtenerIva = async (ivaIdParam = 1) => {
  try {
      const response = await getAllIva();
      const ivaData = response.data.find(iva => iva.id === ivaIdParam);
      if (ivaData) {
          setTasaIva(parseFloat(ivaData.porcentaje));  // Convertir a decimal (Ej. 0.08 o 0.16)
      }
  } catch (error) {
      console.error("Error al obtener IVA:", error);
  }
};

    // Columnas de la tabla
    const columns = [
      { title: "Código", dataIndex: "id", key: "id" },
      { title: "Nombre del Servicio", dataIndex: "nombreServicio", key: "nombreServicio" },
      { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
      { title: "Precio", dataIndex: "precio", key: "precio", render: (precioMXN) => {
        // Si es USD, dividir entre factorConversion
        const precioConvertido = (precioMXN / factorConversion).toFixed(2);
        return `$${precioConvertido} ${esUSD ? "USD" : "MXN"}`;
      },},
      { title: "Importe", key: "importe", render: (_, record) => {
        // Calcula el importe en MXN primero
        const importeMXN = record.cantidad * record.precio;
        // Lo convierte si la moneda es USD
        const importeConvertido = (importeMXN / factorConversion).toFixed(2);
        return `$${importeConvertido} ${esUSD ? "USD" : "MXN"}`;
      },},
  ];

  const handlecrearFactura=async(values)=>{
    const datosFactura={
      notas:values.notas|| "",
      ordenCompra: values.ordenCompra||"",
      fechaExpedicion: values.fechaExpedicion.format("YYYY-MM-DDTHH:mm:ss[Z]"),  // Formato correcto de fecha
        ordenTrabajo: parseInt(id),  // ID de la orden de trabajo
        tipoCfdi: values.tipoCfdi,  // ID del CFDI seleccionado
        formaPago: values.formaPago,  // ID de la forma de pago seleccionada
        metodoPago: values.metodoPago  // ID del método de pago seleccionado
    }
    try {
      message.success("Factura creada con éxito");
      const response = await createFactura( datosFactura);
      const facturaId = response.data.id; // Suponiendo que la API retorna el ID en response.data.id
      message.success("Factura creada con éxito");
      console.log("Factura creada:", response.data);
      navigate(`/detallesfactura/${facturaId}`);
  } catch (error) {
      console.error("Error al crear la factura:", error);
      message.error("Error al crear la factura");
  }
  }

  return (
    <div className="factura-container">
      <div className="factura-header">
        <h1>Facturar {codigoOrden }</h1>
      </div>

      <div className="factura-emisor-receptor">
        <div className="emisor">
          <h3>Emisor</h3>
          {organizacion ? (
              <>
                  <p><strong>{organizacion.nombre}</strong></p>
                  <p>RFC: {rfcEmisor || "Cargando..."}</p>
                  <p>Dirección: {organizacion.estado}, {organizacion.ciudad}, {organizacion.colonia}, {organizacion.calle}, {organizacion.numero}, {organizacion.codigoPostal}</p>
              </>
          ) : (
              <p>Cargando datos de la organización...</p>
          )}
        </div>
        <div className="receptor">
          <h3>Receptor</h3>
          {empresa ? (
              <>
                  <p><strong>{empresa.nombre}</strong></p>
                  <p>RFC: {empresa.rfc}</p>
                  <p>Régimen Fiscal: {empresa.regimenFiscal}</p>
              </>
          ) : (
              <p>Cargando datos de la empresa...</p>
          )}
        </div>
      </div>

      <Form layout="vertical" className="my-factura-form"
      form={form} // Conecta el formulario con la instancia
      onFinish={handlecrearFactura}>
        <div className="factura-details">
          <div className="horizontal-group">
            <Form.Item
              label="Fecha y Hora"
              name="fechaExpedicion"
              rules={[{ required: true, message: "Selecciona la fecha y hora" }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div className="horizontal-group">
          <Form.Item label="Tipo CFDI" name="tipoCfdi" rules={[{ required: true, message: "Selecciona el Uso CFDI" }]}>
                <Select placeholder="Selecciona uso CFDI">
                    {usoCfdiList?.map((uso) => (
                        <Option key={uso.id} value={uso.id}>
                            {uso.codigo} - {uso.descripcion}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="Forma de Pago" name="formaPago" rules={[{ required: true, message: "Selecciona la Forma de Pago" }]}>
                <Select placeholder="Selecciona forma de pago">
                    {formaPagoList?.map((pago) => (
                        <Option key={pago.id} value={pago.id}>
                            {pago.codigo} - {pago.descripcion}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="Método de Pago" name="metodoPago" rules={[{ required: true, message: "Selecciona el Método de Pago" }]}>
                <Select placeholder="Selecciona método de pago">
                    {metodoPagoList?.map((metodo) => (
                        <Option key={metodo.id} value={metodo.id}>
                            {metodo.codigo} - {metodo.descripcion}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
          </div>
        </div>

        <Table
              dataSource={ordenTrabajoServicios}
              columns={columns}
              loading={loading}
              rowKey="id"
          />

        <Row gutter={16}>
          <Col span={14}>
          <div className="form-additional">
          <Form.Item label="Comentarios:" name="notas">
            <TextArea rows={5} placeholder="Agrega comentarios adicionales" />
          </Form.Item>
          <Form.Item label="ordenCompra:" name="ordenCompra">
            <Input />
            </Form.Item>
        </div>
          </Col>
          <Col span={10}>
            <div className="factura-summary">
            <Form.Item label="Subtotal:" name="subtotal">
            <Input value={`$${(subtotal / factorConversion).toFixed(2)} ${esUSD ? "USD" : "MXN"}`}
              disabled  />
            </Form.Item>
            <Form.Item label="tasa IVA:">
              <Input value={`${tasaIva}%`} disabled />
            </Form.Item>
            <Form.Item label="IVA:" name="iva">
              <Input value={`$${(iva / factorConversion).toFixed(2)} ${esUSD ? "USD" : "MXN"}`}
              disabled />
            </Form.Item>
            <Form.Item label="Total:" name="total">
              <Input value={`$${(total / factorConversion).toFixed(2)} ${esUSD ? "USD" : "MXN"}`}
              disabled />
            </Form.Item>
          </div>
          </Col>
        </Row>
        <div className="factura-buttons">
          <Button type="primary" htmlType="submit" style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}>
            Confirmar datos
          </Button>
          <Button type="danger" style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }}>
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CrearFactura;