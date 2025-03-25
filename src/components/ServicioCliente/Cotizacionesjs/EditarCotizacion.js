import React, { useState, useEffect } from "react";
import "./Crearcotizacion.css";
import { Form, Input, Button, Row, Col, Select, Checkbox, Divider, message, DatePicker, Card, Modal, Result, Text } from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { getCotizacionById, updateCotizacion } from "../../../apis/ApisServicioCliente/CotizacionApi";
import { getAllCotizacionServicio, updateCotizacionServicio, createCotizacionServicio, deleteCotizacionServicio } from "../../../apis/ApisServicioCliente/CotizacionServicioApi";
import { getAllTipoMoneda } from "../../../apis/ApisServicioCliente/Moneda";
import { getAllIva } from "../../../apis/ApisServicioCliente/ivaApi";
import { getAllServicio, getServicioById } from "../../../apis/ApisServicioCliente/ServiciosApi";
import { getInfoSistema } from "../../../apis/ApisServicioCliente/InfoSistemaApi";

const { TextArea } = Input;

const EditarCotizacion = () => {
     const navigate = useNavigate();
     const { id } = useParams(); // Obtener el ID de la cotización desde la URL
     const [cotizacionData, setCotizacionData] = useState(null);
     const [fechaSolicitada, setFechaSolicitada] = useState(null);
     const [fechaCaducidad, setFechaCaducidad] = useState(null);
     const [tiposMonedaData, setTiposMonedaData] = useState([]);
     const [tipoMonedaSeleccionada, setTipoMonedaSeleccionada] = useState(null);
     const [ivasData, setIvasData] = useState([]);
     const [ivaSeleccionado, setIvaSeleccionado] = useState(null);
     const [descuento, setDescuento] = useState(0);
     const [tipoCambioDolar, setTipoCambioDolar] = useState(1);
     const [servicios, setServicios] = useState([]);
     const [conceptos, setConceptos] = useState([]);
     const [isModalVisible, setIsModalVisible] = useState(false);
     const [serviciosRelacionados, setServiciosRelacionados] = useState([]);
   
     // Obtener tipo de cambio del dólar
     useEffect(() => {
       const fetchTipoCambio = async () => {
         try {
           const response = await getInfoSistema();
           setTipoCambioDolar(parseFloat(response.data[0].tipoCambioDolar));
         } catch (error) {
           console.error("Error al obtener el tipo de cambio del dólar", error);
         }
       };
       fetchTipoCambio();
     }, []);

     useEffect(() => {
          if (!id) return;
        
          const fetchCotizacion = async () => {
            try {
              const response = await getCotizacionById(id);
              const cotizacion = response.data;
              //console.log("Cotización obtenida:", cotizacion);
        
              setCotizacionData(cotizacion);
              setFechaSolicitada(dayjs(cotizacion.fechaSolicitud));  // ✅ Asignamos fecha correctamente
              setFechaCaducidad(dayjs(cotizacion.fechaCaducidad));
              setTipoMonedaSeleccionada(cotizacion.tipoMoneda);  // ✅ Se asegura que la moneda se asigne correctamente
              setIvaSeleccionado(cotizacion.iva);
              setDescuento(cotizacion.descuento);
        
              // Obtener servicios relacionados con la cotización
              const cotizacionServicios = cotizacion.servicios;
              //console.log("Servicios de la cotización:", cotizacionServicios);
        
              const cotizacionServicioResponse = await getAllCotizacionServicio();
              const cotizacionServicioRecords = cotizacionServicioResponse.data;
              //console.log("Registros de Cotización Servicio:", cotizacionServicioRecords);
        
              // Filtramos los registros que pertenecen a esta cotización
              const filteredCotizacionServicios = cotizacionServicioRecords.filter(
                (record) => Number(record.cotizacion) === Number(id)
              );
        
              //console.log("Registros filtrados de Cotización Servicio:", filteredCotizacionServicios);
        
              // Obtener información detallada de cada servicio en la cotización
              const serviciosConDetalles = await Promise.all(
                filteredCotizacionServicios.map(async (record) => {
                  const servicioResponse = await getServicioById(record.servicio);
                  return {
                    id: record.id,
                    servicio: record.servicio,
                    nombreServicio: servicioResponse.data.nombreServicio,
                    cantidad: record.cantidad,
                    precio: parseFloat(servicioResponse.data.precio) || 0,
                    descripcion: record.descripcion,
                    cotizacion: record.cotizacion,
                    precioEditable: record ? record.precio : parseFloat(servicioResponse.data.precio) || 0,
                  };
                })
              );
              
        
              //console.log("Servicios con detalles:", serviciosConDetalles);
              setConceptos(serviciosConDetalles);
            } catch (error) {
              console.error("Error al obtener la cotización", error);
              message.error("Error al cargar la cotización");
            }
          };
        
          fetchCotizacion();
        }, [id]);
        

   
   
     useEffect(() => {
       const fetchTipoMoneda = async () => {
         try {
           const response = await getAllTipoMoneda();
           setTiposMonedaData(response.data);
         } catch (error) {
           console.error("Error al cargar los tipos de moneda", error);
         }
       };
   
       const fetchIva = async () => {
         try {
           const response = await getAllIva();
           setIvasData(response.data);
         } catch (error) {
           console.error("Error al cargar el IVA", error);
         }
       };
   
       const fetchServicios = async () => {
         try {
           const response = await getAllServicio();
           setServicios(response.data);
         } catch (error) {
           console.error("Error al cargar los servicios", error);
         }
       };
   
       fetchTipoMoneda();
       fetchIva();
       fetchServicios();
     }, []);

     useEffect(() => {
  if (conceptos.length > 0 && servicios.length > 0) {
    // Obtén todos los IDs de servicio que están en la cotización
    const usedServiceIds = conceptos.map(c => c.servicio);
    // Filtra la lista global de servicios para quedarte solo con esos
    const filtered = servicios.filter(s => usedServiceIds.includes(s.id));
    setServiciosRelacionados(filtered);
  }
}, [conceptos, servicios]);
   
     // Actualizar estado de los campos del formulario
     const handleInputChange = (id, field, value) => {
       setConceptos(conceptos.map(concepto =>
         concepto.id === id ? { ...concepto, [field]: value } : concepto
       ));
     };

       /*const handleRemoveConcepto = (id) => {
         if (conceptos.length > 1) {
           setConceptos(conceptos.filter((concepto) => concepto.id !== id));
         } else {
           message.warning("Debe haber al menos un concepto.");
         }
       };*/

       const handleToggleEliminar = (id, checked) => {
        // Verificar si al marcar se estaría dejando sin ningún concepto activo
        const notDeletedCount = conceptos.filter(c => !c.eliminar).length;
        if (checked && notDeletedCount === 1) {
          message.warning("Debe haber al menos un concepto.");
          return;
        }
        setConceptos(conceptos.map(c =>
          c.id === id ? { ...c, eliminar: checked } : c
        ));
      };
      

   
     // Calcular totales
     const calcularTotales = () => {
          if (!conceptos || conceptos.length === 0) {
            return {
              subtotal: 0,
              descuentoValor: 0,
              subtotalConDescuento: 0,
              iva: 0,
              total: 0,
            };
          }
        
          const subtotal = conceptos.reduce((acc, curr) => {
            const precio = parseFloat(curr.precioEditable) || 0;
            const cantidad = parseInt(curr.cantidad, 10) || 0;
            return acc + cantidad * precio;
          }, 0);
        
          const descuentoPorcentaje = parseFloat(descuento) || 0;
          const descuentoValor = subtotal * (descuentoPorcentaje / 100);
          const subtotalConDescuento = subtotal - descuentoValor;
        
          const ivaPorcentaje = parseFloat(
            ivasData.find(iva => iva.id === ivaSeleccionado)?.porcentaje || 16
          );
          const iva = subtotalConDescuento * (ivaPorcentaje);
        
          const factorConversion = tipoMonedaSeleccionada === 2 ? parseFloat(tipoCambioDolar) || 1 : 1;
          const total = subtotalConDescuento + iva;
        
          return {
            subtotal: subtotal / factorConversion,
            descuentoValor: descuentoValor / factorConversion,
            subtotalConDescuento: subtotalConDescuento / factorConversion,
            iva: iva / factorConversion,
            total: total / factorConversion,
          };
        };

        const handleServicioChange = (conceptoId, servicioId) => {
          // Verificar si el servicio ya está seleccionado en otro concepto
          const servicioYaSeleccionado = conceptos.some(
            (c) => c.servicio === servicioId && c.id !== conceptoId
          );
        
          if (servicioYaSeleccionado) {
            message.warning("Este servicio ya está seleccionado en otro concepto.");
            return; // Evita que se agregue duplicado
          }
        
          // Obtener el servicio seleccionado de la lista de servicios
          const servicioSeleccionado = servicios.find(servicio => servicio.id === servicioId);
        
          if (servicioSeleccionado) {
            const updatedConceptos = conceptos.map((concepto) =>
              concepto.id === conceptoId
                ? {
                    ...concepto,
                    servicio: servicioSeleccionado.id,
                    precio: servicioSeleccionado.precio || 0, // ✅ Asignamos el precio correcto
                    precioEditable: servicioSeleccionado.precio || 0, // ✅ También en precioFinal
                    nombreServicio: servicioSeleccionado.nombreServicio, // ✅ Mantenemos el nombre
                  }
                : concepto
            );
            //console.log("Conceptos actualizados:", updatedConceptos);
            setConceptos(updatedConceptos);
          }
        };
        
        
        
        

     const obtenerServiciosDisponibles = (conceptoId) => {
      const serviciosSeleccionados = conceptos
        .filter((c) => c.id !== conceptoId) // Excluye el concepto actual para permitir cambiarlo
        .map((c) => c.servicio) // Obtiene los servicios ya seleccionados

        .filter(Boolean);

        const serviciosDeLaCotizacion = cotizacionData?.servicios?.map((s) => s.id) || [];
    
      return servicios.filter(
          (servicio) => !serviciosSeleccionados.includes(servicio.id) &&
          !serviciosDeLaCotizacion.includes(servicio.id));
    };

     const handleAddConcepto = () => {
          setConceptos([...conceptos, { id: null, servicio: "", cantidad: 1, precio: 0, descripcion: "" }]);
        };
   
     const { subtotal, descuentoValor, subtotalConDescuento, iva, total } = calcularTotales();
   
     // Guardar cambios
     const handleSubmit = async () => {
      try {
        // Obtener la cotización actual
        const response = await getCotizacionById(id);
        const cotizacionActual = response.data;

        // Crear el objeto actualizado combinando la información actual con los nuevos valores
        const cotizacionUpdatePayload = {
          ...cotizacionActual,  // conserva todos los campos actuales
          tipoMoneda: tipoMonedaSeleccionada,
          iva: ivaSeleccionado,
          descuento: descuento,
          denominacion: tipoMonedaSeleccionada === 1 ? "MXN" : "USD",
        };

        await updateCotizacion(id, cotizacionUpdatePayload);

        // 2. Procesar eliminación de conceptos
        const conceptosAEliminar = conceptos.filter(c => c.eliminar);
        const conceptosNoEliminados = conceptos.filter(c => !c.eliminar);
    
        // Si tienes una API para eliminar servicios, puedes iterar los conceptos a eliminar.
        // Asegúrate de haber importado la función, por ejemplo:
        // import { deleteCotizacionServicio } from "../../apis/CotizacionServicioApi";
        const deleteServiciosPromises = conceptosAEliminar.map(async (concepto) => {
          if (concepto.id) {
            try {
              await deleteCotizacionServicio(concepto.id);
              //console.log(`Servicio ${concepto.id} eliminado`);
            } catch (error) {
              console.error(`Error al eliminar servicio ${concepto.id}:`, error);
              throw error;
            }
          }
        });
        await Promise.allSettled(deleteServiciosPromises);
    
        // Procesar los conceptos que se actualizarán o crearán
        const serviciosExistentes = [];
        const nuevosServicios = [];
        // Convertir cotizacionData.servicios en array, como en tu código original
        const serviciosArray = Array.isArray(cotizacionData.servicios)
          ? cotizacionData.servicios
          : Object.values(cotizacionData.servicios);
        const idsServiciosEnCotizacion = serviciosArray.map((s) => parseInt(s, 10));
    
        conceptosNoEliminados.forEach((concepto) => {
          const servicioId = parseInt(concepto.servicio, 10);
          const servicioYaEnCotizacion = idsServiciosEnCotizacion.includes(servicioId);
    
          if (concepto.id) {
            serviciosExistentes.push(concepto);
          } else {
            nuevosServicios.push(concepto);
          }
        });
    
        // Actualizar los servicios existentes
        const updateServiciosPromises = serviciosExistentes.map(async (concepto) => {
          if (!concepto.id) {
            console.error(`❌ El servicio con ID ${concepto.id} no existe en la BD`);
            return;
          }
          const data = {
            id: concepto.id,
            cantidad: parseInt(concepto.cantidad, 10),
            precio: parseFloat(concepto.precioEditable),
            servicio: parseInt(concepto.servicio, 10),
            descripcion: concepto.descripcion,
            cotizacion: parseInt(id, 10),
          };
    
          try {
            //console.log(`🔹 Actualizando servicio existente (ID: ${concepto.id})...`);
            //console.log("Datos a enviar:", data);
            return await updateCotizacionServicio(concepto.id, data);
          } catch (error) {
            console.error(`❌ Error al actualizar servicio ${concepto.id}:`, error.response?.data || error.message);
            throw error;
          }
        });
        const updateServiciosResults = await Promise.allSettled(updateServiciosPromises);
        updateServiciosResults.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Error al actualizar servicio ${index + 1}:`, result.reason);
          }
        });
    
        // Crear los nuevos servicios
        if (nuevosServicios.length > 0) {
          const createServiciosPromises = nuevosServicios.map((concepto) => {
            const data = {
              cantidad: parseInt(concepto.cantidad, 10),
              precio: parseFloat(concepto.precioEditable),
              servicio: parseInt(concepto.servicio, 10),
              descripcion: concepto.descripcion,
              cotizacion: parseInt(id, 10),
            };
            return createCotizacionServicio(data);
          });
          const createServiciosResults = await Promise.allSettled(createServiciosPromises);
          createServiciosResults.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(`Error al crear el servicio nuevo ${index + 1}:`, result.reason);
            } else {
              console.log("Servicio nuevo creado con éxito:", result.value?.data);
            }
          });
        }
    
        message.success("Cotización actualizada correctamente");
        setIsModalVisible(true);
      } catch (error) {
        console.error("Error al actualizar la cotización", error);
        message.error("Error al actualizar la cotización");
      }
    };
    
      
      /*
     useEffect(() => {
          console.log("Estado de conceptos después de la actualización: =>", conceptos);
        }, [conceptos]);*/
   
     return (
       <div className="cotizacion-container">
         <h1 className="cotizacion-title">Editar Cotización</h1>
         <Form layout="vertical">
           <Row gutter={16}>
             <Col span={12}>
               <Form.Item label="Fecha Solicitada">
                 <DatePicker
                   value={fechaSolicitada}
                   onChange={(date) => setFechaSolicitada(date)}
                   format="YYYY-MM-DD"
                   style={{ width: "100%" }}
                 />
               </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item label="Fecha Caducidad">
                 <DatePicker
                   value={fechaCaducidad}
                   onChange={setFechaCaducidad}
                   format="YYYY-MM-DD"
                   style={{ width: "100%" }}
                 />
               </Form.Item>
             </Col>
           </Row>
           <Row gutter={16}>
                     <Col span={12}>
                       <Form.Item label="Tipo de Moneda" rules={[{ required: true, message: 'Por favor selecciona el tipo de moneda.' }]}>
                         <Select
                           value={tipoMonedaSeleccionada}
                           onChange={(value) => setTipoMonedaSeleccionada(value)}
                         >
                           {tiposMonedaData.map((moneda) => (
                             <Select.Option key={moneda.id} value={moneda.id}>
                               {moneda.codigo} - {moneda.descripcion}
                             </Select.Option>
                           ))}
                         </Select>
                       </Form.Item>
                     </Col>
                     <Col span={12}>
                       <Form.Item label="Tasa del IVA actual" rules={[{ required: true, message: 'Por favor selecciona el IVA.' }]}>
                         <Select
                           value={ivaSeleccionado}
                           onChange={(value) => setIvaSeleccionado(value)}
                         >
                           {ivasData.map((ivas) => (
                             <Select.Option key={ivas.id} value={ivas.id}>
                               {ivas.porcentaje}%
                             </Select.Option>
                           ))}
                         </Select>
                       </Form.Item>
                     </Col>
                   </Row>
           
                   <Form.Item label="Descuento (%)" rules={[{ required: true, message: 'Por favor ingresa el descuento.' }]}>
                     <Input
                       type="number"
                       min="0"
                       max="100"
                       defaultValue={0}
                       value={descuento}
                       onChange={(e) => setDescuento(parseFloat(e.target.value))}
                     />
                   </Form.Item>
           
                   <Divider>Agregar Conceptos</Divider>
                   {conceptos.map((concepto, index) => (
                     <div key={index +1}><Card>
                       <h3>Concepto {concepto.id}</h3>
                       <Row justify="end">
                         <div >
                           <Checkbox checked={concepto.eliminar || false}
                           onChange={(e) => handleToggleEliminar(concepto.id, e.target.checked)}>
                             Eliminar
                           </Checkbox>
                         </div>
                       </Row>
                       <Row gutter={16}>
                         <Col span={12}>
                         <Form.Item
                            label="Servicio"
                            rules={[{ required: true, message: 'Por favor selecciona el servicio.' }]}
                          >
                            <Select
                              placeholder="Selecciona un servicio"
                              showSearch
                              optionFilterProp="label"
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare(
                                  (optionB?.label ?? '').toLowerCase()
                                )
                              }
                              value={concepto.nombreServicio || undefined}
                              onChange={(value) => handleServicioChange(concepto.id, value)}
                            >
                              {obtenerServiciosDisponibles(concepto.id).map((servicio) => (
                                <Select.Option
                                  key={servicio.id}
                                  value={servicio.id}
                                  label={servicio.nombreServicio}
                                >
                                  {servicio.nombreServicio}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>

                         </Col>
                         <Col span={12}>
                           <Form.Item label="Cantidad de servicios" rules={[{ required: true, message: 'Por favor ingresa la cantidad.' }]}>
                             <Input
                               type="number"
                               min="1"
                               value={concepto.cantidad}
                               onChange={(e) => handleInputChange(concepto.id, "cantidad", parseInt(e.target.value))}
                             />
                           </Form.Item>
                         </Col>
                       </Row>
                       <Row gutter={16}>
                         <Col span={12}>
                           <Form.Item label="Precio sugerido" rules={[{ required: true, message: 'Por favor ingresa el precio.' }]}>
                             <Input
                               disabled={true}
                               type="number"
                               min="0"
                               value={concepto.precio}
                             />
                           </Form.Item>
                         </Col>
                         <Col span={12}>
                         <Form.Item label="Descripción">
                              <TextArea
                              rows={2}
                              value={concepto.descripcion || ""}
                              onChange={(e) => handleInputChange(concepto.id, "descripcion", e.target.value)}
                              placeholder="Descripción del servicio"
                              />
                              </Form.Item>
                         </Col>
                       </Row>
                       <Row gutter={16}>
                         <Col span={12}>
                           <Form.Item label="Precio final" rules={[{ required: true, message: 'Por favor ingresa el precio.' }]}>
                             <Input
                               type="number"
                               min="0"
                               value={concepto.precioEditable}
                               onChange={(e) => handleInputChange(concepto.id, "precioEditable", parseFloat(e.target.value))}
                             />
                           </Form.Item>
                         </Col>
                       </Row>
                     </Card></div>
                   ))}
                    <Button type="primary" onClick={handleAddConcepto} style={{ marginBottom: "16px" }}>
                     Añadir Concepto
                   </Button>
           
                   <div className="cotizacion-totals-buttons">
                     <div className="cotizacion-totals">
                       <p>Subtotal: {subtotal.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
                       <p>Descuento ({descuento}%): {descuentoValor.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
                       <p>Subtotal con descuento: {subtotalConDescuento.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
                       <p>IVA ({ivasData.find(iva => iva.id === ivaSeleccionado)?.porcentaje || 16}%): {iva.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
                       <p>Total: {total.toFixed(2)} {tipoMonedaSeleccionada === 2 ? "USD" : "MXN"}</p>
                     </div>
                     <div className="cotizacion-action-buttons">
                    <Button type="primary" onClick={handleSubmit}>
                         Guardar Cambios
                    </Button>
                     </div>
                   </div>
           <Divider />
         </Form>
         <Modal
           title="Información"
           open={isModalVisible}
           onOk={() => navigate(`/detalles_cotizaciones/${id}/`)}
           onCancel={() => navigate(`/detalles_cotizaciones/${id}/`)}
           okText="Cerrar"
         >
           <Result status="success" title="¡Se actualizó exitosamente!" />
         </Modal>
       </div>
     );
   };
   
   export default EditarCotizacion;