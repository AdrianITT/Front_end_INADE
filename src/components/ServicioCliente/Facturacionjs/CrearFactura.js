import React, {useState, useEffect} from "react";
import { Form, Input, Button, Select, Row, Col,DatePicker, message, Table } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import "./crearfactura.css";
import { NumericInput } from "../../NumericInput/NumericInput";
import { getAllTipoCDFI } from "../../../apis/ApisServicioCliente/TipoCFDIApi";
import { getAllFormaPago } from "../../../apis/ApisServicioCliente/FormaPagoApi";
import { getAllMetodopago } from "../../../apis/ApisServicioCliente/MetodoPagoApi";
import { getAllServicio } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { getAllCSD } from "../../../apis/ApisServicioCliente/csdApi";
import { createFactura,getAllDataFacturaById } from "../../../apis/ApisServicioCliente/FacturaApi";
import { getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";

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
    const [tipomoneda, setTipoMoneda] = useState(1);
    const [valor, setvalores]= useState([]);
    const navigate = useNavigate();
    const [moneda, setMoneda] = useState({ codigo: "", descripcion: "" });
    const [cotizacionId, setCotizacionId] = useState(null);
    //const [cotizacion, setcotizacionData]=useState(null);
    const [formaPagoGlobal, setFormaPagoGlobal] = useState(null);
    const [loadingFormasPago, setLoadingFormasPago] = useState(false);


    // Estados
    const [tasaIva, setTasaIva] = useState(8);
    const [subtotal, setSubtotal] = useState(0);
    const [iva, setIva] = useState(0);
    const [total, setTotal] = useState(0);
    const[descuento, setDescuento]=useState(0);
    console.log("Moneda codigo:", moneda.codigo.codigo);
    const esUSD = String(moneda.codigo.codigo).toUpperCase() === "USD" || moneda.codigo.id === 2;
    const factorConversion = esUSD ? tipoCambioDolar : 1;

    // Cargar datos al montar el componente
    useEffect(() => {
      obtenerUsoCfdi();
      obtenerFormaPago();
      obtenerMetodoPago();
      obtenerRFCEmisor();
      fetchTipoCambio();
  }, [id]);

  useEffect(() => {
    const fetchFacturaData = async () => {
      try {
        const response = await getAllDataFacturaById(id);
        const data = response.data;
        console.log("Datos de la factura:", data);
        console.log("Empresa:", data.empresa);
        console.log("data.organizacion:", data.organizacion);
        console.log("data.valores:", data.valores);
        // Datos directos
        setCodigoOrden(data.ordenTrabajo.codigo);
        setEmpresa(data.empresa);
        setOrganizacion(data.organizacion);
        setTasaIva(parseFloat(data.cotizacion.iva.porcentaje));
        setDescuento(data.cotizacion.descuento);
        setOrdenTrabajoServicios(data.servicios); // Ya vienen con nombre, precio, cantidad
        setSubtotal(data.valores.subtotal);
        setIva(data.valores.iva);
        setTotal(data.valores.total);
        setvalores(data.valores);
        setTipoMoneda(data.cotizacion.tipoMoneda);

        form.setFieldsValue({
          subtotal: `$${data.valores.subtotal } ${data.cotizacion.tipoMoneda.codigo}`,
          iva: `$${data.valores.iva } ${data.cotizacion.tipoMoneda.codigo }`,
          total: `$${data.valores.total} ${data.cotizacion.tipoMoneda.codigo } `
        });
        form.setFieldsValue({ poresentajeFactura: 0 });
  
        // Moneda
        setMoneda({ codigo: data.cotizacion.tipoMoneda, descripcion: "" }); // puedes expandir si quieres mostrar descripción
      } catch (error) {
        console.error("Error al obtener datos completos de la factura:", error);
        message.error("No se pudo cargar la información de la factura.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchFacturaData();
  }, [id]);

  
  
  
  const fetchTipoCambio = async () => {
        try {
          const response = await getInfoSistema();
          const tipoCambio = parseFloat(response.data[0].tipoCambioDolar);
          setTipoCambioDolar(tipoCambio);
        } catch (error) {
          console.error("Error al obtener el tipo de cambio del dólar", error);
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

  const columns = [
    {
      title: "Código",
      dataIndex: "servicio",
      key: "codigo",
      render: (serv) => serv?.metodo.codigo || "N/A",
    },
    {
      title: "Nombre del Servicio",
      dataIndex: "servicio",
      key: "nombreServicio",
      render: (serv) => serv?.nombre || "N/A",
    },
    {
      title: "Cantidad",
      key: "cantidad",
      render: (_, record) => record?.ordenTrabajoServicio?.cantidad || 0,
    },    
    {
      title: "Precio",
      key: "precio",
      render: (_, record) => {
        const precio = record?.cotizacionServicio?.precio || 0;
        return `$${(precio).toFixed(2)} ${esUSD ? "USD" : "MXN"}`;
      },
    },
    {
      title: "Importe",
      key: "importe",
      render: (_, record) => {
        const precio = record?.cotizacionServicio?.precio || 0;
        const cantidad = record?.ordenTrabajoServicio?.cantidad || 0;
        const importe = precio * cantidad;
        return `$${(importe).toFixed(2)} ${esUSD ? "USD" : "MXN"}`;
      },
    },
    
  ];
  
  


  const handlecrearFactura=async(values)=>{
    const importeEnMoneda = parseFloat(total) ;
    const porcentaje = values.poresentajeFactura ?? 0;
    const preioDescuento = parseFloat(importeEnMoneda) * ((100-porcentaje ) / 100);
    const datosFactura={
      notas:values.notas|| "",
      ordenCompra: values.ordenCompra||"",
      fechaExpedicion: values.fechaExpedicion.format("YYYY-MM-DDTHH:mm:ss[Z]"),  // Formato correcto de fecha
      ordenTrabajo: parseInt(id),  // ID de la orden de trabajo
      tipoCfdi: values.tipoCfdi,  // ID del CFDI seleccionado
      formaPago: values.formaPago,  // ID de la forma de pago seleccionada
      metodoPago: values.metodoPago, // ID del método de pago seleccionado
      importe: preioDescuento.toFixed(2),
      tipoMoneda: tipomoneda.codigo,
      porcentaje:values?.poresentajeFactura||0,
    }
    try {
      message.success("Factura creada con éxito");
      const response = await createFactura( datosFactura);
      const facturaId = response.data.id; // Suponiendo que la API retorna el ID en response.data.id
      message.success("Factura creada con éxito");
      //console.log("Factura creada:", response.data);
      navigate(`/detallesfactura/${facturaId}`);
  } catch (error) {
      console.error("Error al crear la factura:", error);
      message.error("Error al crear la factura");
  }
  }
  const toFixedSeguro = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };
  
  

  return (
    <div className="factura-container">
      <div className="factura-header">
        <h1>Facturar {codigoOrden }</h1>
      </div>

      <Row gutter={24} className="factura-emisor-receptor">
        <Col span={12}>
          <div className="emisor">
            <h3>Emisor</h3>
            {organizacion ? (
              <>
                <p><strong>{organizacion.nombre}</strong></p>
                <p><strong>RFC:</strong> {rfcEmisor || "Cargando..."}</p>
                <p><strong>Dirección:</strong></p>
                <ul style={{ marginLeft: 16 }}>
                  <li><strong>Estado:</strong> {organizacion.direccion.estado}</li>
                  <li><strong>Ciudad:</strong> {organizacion.direccion.ciudad}</li>
                  <li><strong>Colonia:</strong> {organizacion.direccion.colonia}</li>
                  <li><strong>Calle:</strong> {organizacion.direccion.calle}</li>
                  <li><strong>Número:</strong> {organizacion.direccion.numero}</li>
                  <li><strong>Código Postal:</strong> {organizacion.direccion.codigoPostal}</li>
                </ul>
              </>
            ) : (
              <p>Cargando datos de la organización...</p>
            )}
          </div>
        </Col>

        <Col span={12}>
          <div className="receptor">
            <h3>Receptor</h3>
            {empresa ? (
              <>
                <p><strong>{empresa.nombre}</strong></p>
                <p><strong>RFC:</strong> {empresa.rfc}</p>
                <p><strong>Dirección:</strong></p>
                <ul style={{ marginLeft: 16 }}>
                  <li><strong>Estado:</strong> {empresa.direccion.estado}</li>
                  <li><strong>Ciudad:</strong> {empresa.direccion.ciudad}</li>
                  <li><strong>Colonia:</strong> {empresa.direccion.colonia}</li>
                  <li><strong>Calle:</strong> {empresa.direccion.calle}</li>
                  <li><strong>Número:</strong> {empresa.direccion.numero}</li>
                  <li><strong>Código Postal:</strong> {empresa.direccion.codigoPostal}</li>
                </ul>
              </>
            ) : (
              <p>Cargando datos de la empresa...</p>
            )}
          </div>
        </Col>
      </Row>


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
            <Form.Item
                label="Forma de Pago"
                name="formaPago"
                rules={[{ required: true, message: "Selecciona la Forma de Pago" }]}
              >
                <Select
                  placeholder="Selecciona forma de pago"
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
                  {formaPagoList?.map((pago) => (
                    <Select.Option
                      key={pago.id}
                      value={pago.id}
                      label={`${pago.codigo} - ${pago.descripcion}`}
                    >
                      {`${pago.codigo} - ${pago.descripcion}`}
                    </Select.Option>
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
            <Form.Item label="Poresentaje a pagar:" name="poresentajeFactura">
              <NumericInput
                value={form.getFieldValue("poresentajeFactura")}
                onChange={(val) => form.setFieldsValue({ poresentajeFactura: val })}
                style={{ width: '100%' }}
              />
            </Form.Item>

        </div>
          </Col>
          <Col span={10}>
            <div className="factura-summary">
            <Form.Item label="Subtotal:" name="subtotal">
            <Input value={`$${valor.subtotal} ${esUSD ? "USD" : "MXN"}`} disabled />
            </Form.Item>
            <Form.Item label="Descuento:">
              <Input value={`${descuento}`} disabled />
            </Form.Item>
            <Form.Item label="tasa IVA:">
              <Input value={`${(tasaIva * 100).toFixed(2)}%`} disabled />
            </Form.Item>
            <Form.Item label="IVA:" name="iva">
              <Input value={`$${valor.iva}${esUSD ? "USD" : "MXN"}`}
              disabled />
            </Form.Item>
            <Form.Item label="Total:" name="total">
              <Input value={`$${valor.total} ${esUSD ? "USD" : "MXN"}`}
              disabled />
            </Form.Item>
          </div>
          </Col>
        </Row>
        <div className="factura-buttons">
          <Button type="primary" htmlType="submit" style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}>
            Confirmar datos
          </Button>
          <Button
            type="danger"
            style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }}
            onClick={() => navigate(`/DetalleOrdenTrabajo/${id}`)}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CrearFactura;