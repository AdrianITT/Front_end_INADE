import React, {useState, useEffect, useMemo} from "react";
import moment from 'moment';
import { Form, Input, Button, Select, Row, Col,DatePicker, message, Table } from "antd";
import { useParams, useNavigate, data } from "react-router-dom";
import "./crearfactura.css";
import { NumericInput } from "../../NumericInput/NumericInput";
import { getAllTipoCDFI } from "../../../apis/ApisServicioCliente/TipoCFDIApi";
import { getAllFormaPago } from "../../../apis/ApisServicioCliente/FormaPagoApi";
import { getAllMetodopago } from "../../../apis/ApisServicioCliente/MetodoPagoApi";
import {getDataCotizacionBy} from "../../../apis/ApisServicioCliente/CotizacionApi";
import {createServicioFactura } from "../../../apis/ApisServicioCliente/FacturaServicio";
//import { getAllServicio } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { createFactura,getAllDataFacturaById, getAllFacturaByOrganozacion } from "../../../apis/ApisServicioCliente/FacturaApi";
import { getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";
import { cifrarId, descifrarId } from "../secretKey/SecretKey";
import { validarAccesoPorOrganizacion } from "../validacionAccesoPorOrganizacion";
import { getAllcotizacionesdata } from "../../../apis/ApisServicioCliente/CotizacionApi";


const { TextArea } = Input;
const { Option } = Select;

const CrearFactura = () => {
    const [form] = Form.useForm();
    const { ids } = useParams();
    const id = descifrarId(ids);
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
    const [selectedRows, setSelectedRows] = useState([]);
    const [descuentoGlobal, setDescuentoGlobal] = useState(0);
    const [totalServicios, setTotalServicios] = useState(0);
    //const factorConversion = esUSD ? tipoCambioDolar : 1;
    // Obtener el ID de la organización una sola vez
        const organizationId = useMemo(() => parseInt(localStorage.getItem("organizacion_id"), 10), []);

        useEffect(() => {
          const verificar = async () => {
            console.log(id);
            const acceso = await validarAccesoPorOrganizacion({
              fetchFunction: getAllcotizacionesdata,
              organizationId,
              id,
              campoId: "Cotización",
              navigate,
              mensajeError: "Acceso denegado a esta precotización.",
            });
            console.log(acceso);
            if (!acceso) return;
          };
      
          verificar();
        }, [organizationId, id]);
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
        //console.log("1data: ", d);
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
  

  useEffect(() => {
    const calcularTotalesExcluyendoSeleccionados = async () => {
      if (!dataID || !dataID.valores) return;
      
      const serviciosNoSeleccionados = serviciosCot.filter(
        item => !selectedRowKeys.includes(item.id)
      );
  
      const subtotal = serviciosNoSeleccionados.reduce(
        (acc, item) => acc + (Number(item.cantidad) * Number(item.precio)),
        0
      );
      console.log("subtotal: ", dataID);
  
      const valorDescuento = subtotal * (dataID.valores.descuentoPorcentaje|| 0) / 100;
      const subtotalConDescuento = subtotal - valorDescuento;
      const ivaValor = subtotalConDescuento * (tasaIva || 0.16);
      const importe = subtotalConDescuento + ivaValor;
  
      setResumenCot({
        subtotal,
        descuento: valorDescuento,
        iva: ivaValor,
        importe
      });
    };
  
    calcularTotalesExcluyendoSeleccionados();
  }, [selectedRowKeys, serviciosCot, tasaIva]);
  
  
  
  
  const onSelectChange = (newSelectedRowKeys,newSelectedRows) => {
    //console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
    
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
          const sortedList = response.data.sort((a, b) => {
            if (a.codigo === "99") return -1; // a va primero
            if (b.codigo === "99") return 1;  // b va primero
            return 0; // no cambia el orden
          });
          console.log("Forma de Pago:", sortedList);
          setFormaPagoList(sortedList);
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
        `$${parseFloat(precio).toFixed(3)} ${tipoMoneda.codigo}`
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: sub =>
        `$${parseFloat(sub).toFixed(3)} ${tipoMoneda.codigo}`
    },
    
  ];
  
  


  const handlecrearFactura = async (values) => {
    const porcentajeFactura = values.poresentajeFactura ?? 0;    // e.g. 50
    const tasaIVA = tasaIva;                                    // e.g. 0.16
  
    // 1) Servicios que ELIMINAMOS (los seleccionados) y por tanto facturamos los NO seleccionados
    const serviciosAFacturar = serviciosCot.filter(
      s => !selectedRowKeys.includes(s.id)
    );
  
    // 2) Subtotal de esos servicios
    const subtotal = serviciosAFacturar.reduce((sum, s) =>
      sum + parseFloat(s.precio) * s.cantidad, 0
    );
  
    // 3) Porcentaje de descuento original de la cotización
    const descuentoCotPct = parseFloat(dataID.valores.descuentoPorcentaje) / 100;
    
    // 4) Aplicar descuento original
    const subtotalConDescOriginal = ((subtotal).toFixed(2) * (1 - descuentoCotPct)).toFixed(2);
  
    // 5) Aplicar % de la factura
    const subtotalConPctFactura = (subtotalConDescOriginal * (1 - (porcentajeFactura / 100))).toFixed(2);
  
    // 6) Aplicar IVA
    const totalConIva = subtotalConPctFactura * (1 + tasaIVA);
  
    // 7) Armar payload
    const datosFactura = {
      notas:           values.notas || "",
      ordenCompra:     values.ordenCompra || "",
      fechaExpedicion: values.fechaExpedicion.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      ordenTrabajo:    parseInt(id, 10),
      tipoCfdi:        values.tipoCfdi,
      formaPago:       values.formaPago,
      metodoPago:      values.metodoPago,
      porcentaje:      porcentajeFactura,
      importe:         totalConIva.toFixed(2),
      tipoMoneda:      tipoMoneda.codigo,
      cotizacion:      id,
    };
  
    // 8) Crear factura
    const response = await createFactura(datosFactura);
    const facturaId = response.data.id;
  
    try {
      // 9) Guardar solo los servicios NO seleccionados
      await Promise.all(
        serviciosAFacturar.map(s =>
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
      navigate(`/detallesfactura/${cifrarId(facturaId)}`);
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
              rowSelection={{rowSelection,onChange: onSelectChange}}
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
          <Form.Item label="orden de Compra:" name="ordenCompra">
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
              <Input value={`$${resumenCot.subtotal.toFixed(3)} ${tipoMoneda.codigo}`} disabled />
            </Form.Item>
            <Form.Item label="Descuento:">
              <Input value={`$${resumenCot.descuento.toFixed(3)} ${tipoMoneda.codigo}`} disabled />
            </Form.Item>
            <Form.Item label="Tasa IVA:">
              <Input value={`${(tasaIva).toFixed(3)}%`} disabled />
            </Form.Item>
            <Form.Item label="IVA:">
              <Input value={`$${resumenCot.iva.toFixed(3)} ${tipoMoneda.codigo}`} disabled />
            </Form.Item>
            <Form.Item label="Total:">
              <Input value={`$${resumenCot.importe.toFixed(3)} ${tipoMoneda.codigo}`} disabled />
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
            onClick={() => navigate(`/detalles_cotizaciones/${id}`)}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CrearFactura;