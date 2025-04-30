import React, {useState, useEffect} from "react";
import moment from 'moment';
import { Form, Input, Button, Select, Row, Col,DatePicker, message, Table } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import "./crearfactura.css";
import { NumericInput } from "../../NumericInput/NumericInput";
import { getAllTipoCDFI } from "../../../apis/ApisServicioCliente/TipoCFDIApi";
import { getAllFormaPago } from "../../../apis/ApisServicioCliente/FormaPagoApi";
import { getAllMetodopago } from "../../../apis/ApisServicioCliente/MetodoPagoApi";
import {getDataCotizacionBy} from "../../../apis/ApisServicioCliente/CotizacionApi";
import {createServicioFactura } from "../../../apis/ApisServicioCliente/FacturaServicio";
//import { getAllServicio } from "../../../apis/ApisServicioCliente/ServiciosApi";
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
    const [organizacion, setOrganizacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState(null);
    const [dataID, setDataID] = useState(null);

    const [tipoMoneda, setTipoMoneda] = useState({
         id: null,
         codigo: "",
         descripcion: ""
       });

    const navigate = useNavigate();

    //const [cotizacionId, setCotizacionId] = useState(null);
    //const [cotizacion, setcotizacionData]=useState(null);
    const [formaPagoGlobal, setFormaPagoGlobal] = useState(null);
    const [loadingFormasPago, setLoadingFormasPago] = useState(false);
    const [serviciosCot, setServiciosCot] = useState([]);
    const [resumenCot, setResumenCot] = useState({
      subtotal: 0, descuento: 0, iva: 0, importe: 0
    });
    


    // Estados
    const [tasaIva, setTasaIva] = useState(8);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    //const factorConversion = esUSD ? tipoCambioDolar : 1;

    // Cargar datos al montar el componente
    useEffect(() => {
      obtenerUsoCfdi();
      obtenerFormaPago();
      obtenerMetodoPago();
      fetchTipoCambio();
  }, [id]);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await getDataCotizacionBy(id);
        const d = res.data;
        console.log("1data: ", d);
        setDataID(d);
        // EMISOR / RECEPTOR
        setOrganizacion(d.emisor);   // antes ponías d.empresa, ahora es d.emisor
        setEmpresa(d.receptor);      // antes ponías d.empresa pero JSON lo llama receptor
  
        // MONEDA
        setTipoMoneda(d.tipoMoneda);
  
        // SERVICIOS
        setServiciosCot(d.servicios);    // JSON viene en "servicios"
  
        // RESUMEN
        setResumenCot({
          subtotal:      parseFloat(d.valores.subtotal),
          descuento:     parseFloat(d.valores.valorDescuento),
          iva:           parseFloat(d.valores.ivaValor),
          importe:       parseFloat(d.valores.importe)
        });
  
        // IVA porcentual
        setTasaIva(parseFloat(d.valores.ivaPorcentaje));
  
        // Fecha del picket

        form.setFieldsValue({ poresentajeFactura: 0 });
  
      } catch (err) {
        console.error(err);
        message.error("No se pudo obtener la cotización.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);
  

  
  const onSelectChange = newSelectedRowKeys => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: changeableRowKeys => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: changeableRowKeys => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
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
    { title: "Método",
      dataIndex: ["metodo", "codigo"], 
      key: "metodo" 
    },
    { title: "Servicio",
      dataIndex: ["servicio", "nombre"], 
      key: "servicioNombre" 
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },    
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      render: precio =>
        `$${parseFloat(precio).toFixed(2)} ${tipoMoneda.codigo}`
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: sub =>
        `$${parseFloat(sub).toFixed(2)} ${tipoMoneda.codigo}`
    },
    
  ];
  
  


  const handlecrearFactura = async (values) => {
    // 0) Obtener porcentaje de descuento y tasa de IVA
    const porcentaje = values.poresentajeFactura ?? 0;      // e.g. 10 → 10%
    const tasaIVA    = tasaIva;                            // e.g. 0.16 → 16%
  
  
    // 2) Calcular servicios NO seleccionados
    const noSeleccionados = serviciosCot.filter(
      s => !selectedRowKeys.includes(s.id)
    );
  
    // 3) Subtotal de esos servicios
    const subtotalNoSel = noSeleccionados.reduce((sum, s) => {
      return sum + parseFloat(s.precio) * s.cantidad;
    }, 0);
  
    // 4) Aplicar descuento global
    const subtotalConDesc = subtotalNoSel * (1 - porcentaje / 100);
  
    // 5) Aplicar IVA
    const totalConIva = subtotalConDesc * (1 + tasaIVA);
    try {
    // 6) Montar payload de la factura
    const datosFactura = {
      notas:         values.notas || "",
      ordenCompra:   values.ordenCompra || "",
      fechaExpedicion: values.fechaExpedicion.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      ordenTrabajo: parseInt(id, 10),
      tipoCfdi:     values.tipoCfdi,
      formaPago:    values.formaPago,
      metodoPago:   values.metodoPago,
      importe:      totalConIva.toFixed(2),   // <-- usa el nuevo importe
      tipoMoneda:   tipoMoneda.codigo,
      porcentaje:   porcentaje,
      cotizacion:   id,
    };
  
    
      // 7) Creas la factura
      const response = await createFactura(datosFactura);
      const facturaId = response.data.id;
  
      // 8) Guardas los servicios NO seleccionados en tu tabla intermedia
      await Promise.all(
        noSeleccionados.map(s =>
          createServicioFactura({
            descripcion: s.descripcion,
            precio:      parseFloat(s.precio),
            cantidad:    s.cantidad,
            factura:     facturaId,
            servicio:    s.servicio.id
          })
        )
      );
  
      message.success("Factura creada con éxito");
      navigate(`/detallesfactura/${facturaId}`);
    } catch (error) {
      console.error("Error al crear la factura:", error);
      message.error("Ocurrió un error al crear la factura.");
    }
  };
  

  const toFixedSeguro = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };
  
  

  return (
    <div className="factura-container">
      <div className="factura-header">
        <h1>Facturar cotizacion {dataID?.numero??"" }</h1>
      </div>

      <Row gutter={24} className="factura-emisor-receptor">
        <Col span={12}>
          <div className="emisor">
            <h3>Emisor</h3>
            {organizacion ? (
              <>
                <p><strong>{organizacion.nombre}</strong></p>
                <p><strong>RFC:</strong> {organizacion.rfc || "Cargando..."}</p>
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
              rowSelection={rowSelection}
              dataSource={serviciosCot}
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
            <Form.Item label="Porcentaje a pagar:" name="poresentajeFactura">
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
            <Form.Item label="Subtotal:">
              <Input value={`$${resumenCot.subtotal.toFixed(2)} ${tipoMoneda.codigo}`} disabled />
            </Form.Item>
            <Form.Item label="Descuento:">
              <Input value={`$${resumenCot.descuento.toFixed(2)} ${tipoMoneda.codigo}`} disabled />
            </Form.Item>
            <Form.Item label="Tasa IVA:">
              <Input value={`${(tasaIva).toFixed(2)}%`} disabled />
            </Form.Item>
            <Form.Item label="IVA:">
              <Input value={`$${resumenCot.iva.toFixed(2)} ${tipoMoneda.codigo}`} disabled />
            </Form.Item>
            <Form.Item label="Total:">
              <Input value={`$${resumenCot.importe.toFixed(2)} ${tipoMoneda.codigo}`} disabled />
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