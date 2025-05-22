import React, {useState,useEffect, useMemo} from 'react';
import { Page, Document, StyleSheet, View, Text, Image } from '@react-pdf/renderer';
//import { numeroALetras } from 'numero-a-letras';
//import {getAllDataFactura} from '../../../../apis/ApisServicioCliente/FacturaApi';
//import {getOrganizacionById} from '../../../../apis/ApisServicioCliente/organizacionapi';

//import {  getAllDataFactura, getOrganizacionById } from '../Api/Factura';



// Estilos para el documento
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',           // colocar elementos en una fila
    justifyContent: 'space-between', // uno a la izquierda, otro a la derecha
    alignItems: 'flex-end',            
    marginBottom: 0,
    paddingBottom: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'left',
    
  },
  title2: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  col: {
    flex: 1,
  },
  col2: {
    flex: 2,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
    fontSize: 8
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 8
    //backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    padding: 3,
  },
  colProducto: {
    flex: 0.7 
  },
  colCantidad: { 
    flex: 0.7, 
    //textAlign: 'center' 
  },
  colUnidad: {
    flex: 1.3, 
    textAlign: 'center' 
  },
  colConcepto: { flex: 3 }, // más ancho para descripciones largas
  colPrecio: { 
    flex: 1, 
    textAlign: 'right' 
  },
  colImporte: { 
    flex: 1, 
    textAlign: 'right' 
  },
  totalSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    width: 50,
    fontWeight: 'bold',
  },
  totalValue: {
    width: 50,
    textAlign: 'right',
  },
  pairContainer: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 5, // espacio entre pares
    marginBottom: 5,
    minWidth: '30%', // para que no sean demasiado estrechos
  },
  pairContainerS: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 5, // espacio entre pares
    marginBottom: 5,
    minWidth: '50%', // para que no sean demasiado estrechos
    //justifyContent: 'center'
  },
  textLabel: {
    marginBottom: 2,
    fontWeight: 'bold',
  },
  textoGrande: {
    fontSize: 20,  // tamaño de letra grande
  },
  textoMediano: {
    fontSize: 14,  // tamaño mediano
  },
  textoPequeno: {
    fontSize: 8,  // tamaño pequeño
  },
  pagefooder: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // o '#ccc' para más claro
    marginVertical: 8,
  },
  shortLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '40%',           // o en píxeles: 200
    marginVertical: 8,
    alignSelf: 'center',    // centrada horizontalmente
  },
  shortLine2:{
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    width: '34.9%',           // o en píxeles: 200
    marginVertical: 8,
    alignSelf: 'center',    // centrada horizontalmente
  },
  
});

// Componente de la factura
const FacturaPDF = ({ dataFactura, dataLogo, centavo,centavotext }) => {
  if (!dataFactura || !dataLogo) return <p>Cargando datos...</p>;

  const filasPrimeraPagina = 10;
  const filasRestoPaginas  = 13;
  const serviciosPaginados = dataFactura.servicios.reduce((acc, curr, i) => {
    const page = i < filasPrimeraPagina
      ? 0
      : 1 + Math.floor((i - filasPrimeraPagina) / filasRestoPaginas);
    (acc[page] = acc[page] || []).push(curr);
    return acc;
  }, []);
 

      //  <-- importante
  const hayDescuento = parseFloat(dataFactura.valores.valorDescuento ?? 0) > 0;
  
  /*const total = parseFloat(dataFactura.valores.subtotal);
  const parteEntera = Math.floor(total); // ej: 50
  const centavos = Math.round((total - parteEntera) * 100); // ej: 35 (si el valor fuera 50.35)

  const totalEnLetras = numeroALetras(parteEntera); // "cincuenta */


  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>PREFACTURA</Text>
        <Text style={styles.title2}>FOLIO: {`PREFACTURA ${dataFactura.numerofactura}`}</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
        {/* Logo */}
        <View style={{ width: '30%', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              style={{
                maxWidth: 180,
                width: 150,           // Ancho fijo
                height: 'auto',       // Automáticamente proporcional
                resizeMode: 'contain' // Mantiene relación de aspecto
              }}
              src={dataLogo.logo}
            />
          </View>
        {/* Columna Emisor */}
        <View style={{ width: '30%' }}>
          <Text style={styles.sectionTitle}>Emisor:</Text>
          <Text>{dataFactura?.DataOrganizacion?.nombre??'sin datos'}</Text>
            <Text>{dataFactura?.DataOrganizacion?.rfc ?? 'sin datos'}</Text>
            <Text>Lugar de Expedición: {dataFactura?.DataOrganizacion?.codigoPostal ?? 'sin datos'}</Text>
            <Text>Régimen Fiscal: {dataFactura?.DataOrganizacion?.RegimenFiscal ?? 'sin datos'}- {dataFactura?.DataOrganizacion?.RegimenFiscalNombre ?? 'sin datos'}</Text>
          <Text>Efecto del comprobante: {dataFactura?.tipocfdi ?? 'sin datos'} - {dataFactura?.tipocfdiNombre ?? 'sin datos'}</Text>
        </View>

        {/* Columna Receptor */}
        <View style={{ width: '30%' }}>
          <Text style={styles.sectionTitle}>Receptor:</Text>
          <Text>{dataFactura.empresa}</Text>
          <Text>{dataFactura.rfcEmpresa}</Text>
          <Text>Código postal: {dataFactura.codigoPostalEmpresa}</Text>
          <Text>Uso del CFDI: {dataFactura.UsoCfdi} - {dataFactura.UsoCfdiNombre}</Text>
          <Text>Régimen Fiscal: {dataFactura.regimenFiscal} - {dataFactura.regimenFiscalnombre}</Text>
        </View>
      </View>


      
      {/* Datos de la factura */}
      <View style={styles.section}>
      <View style={styles.row}>
        {/*<View style={[styles.pairContainer, styles.textoPequeno]}>
          <Text style={[styles.textLabel]}>Folio Fiscal:</Text>
          <Text>acb5f07a-ef5e-4847-91ce-a48602abf42b</Text>
        </View> */}
        <View style={styles.shortLine2} />

        <View style={[styles.pairContainerS, styles.textoPequeno]}>
          <Text style={styles.textLabel}>Fecha / Hora de Emisión:</Text>
          <Text>{dataFactura.fecha && new Date(dataFactura.fecha).toLocaleString()}</Text>
        </View>

        {/*<View style={[styles.pairContainer, styles.textoPequeno]}>
          <Text style={styles.textLabel}>No. de Certificado Digital:</Text>
          <Text>30001000000500003316</Text>
        </View> */}
        
      </View>
        <View style={styles.row}>
          <View style={[styles.pairContainer, styles.textoPequeno]}>
            <Text style={styles.textLabel}>Exportación:</Text>
            <Text >01 - No aplica</Text>
          </View>
        </View>
      </View>


      {/* Tabla de productos */}
      {serviciosPaginados.map((grupo, pageIndex) => (
        <View key={pageIndex} style={styles.table}>
          {/* Encabezado de tabla */}
          
          
          <View style={[styles.tableRow, styles.tableHeader]} >
            <Text style={styles.colProducto}>Producto</Text>
            <Text style={styles.colCantidad}>Cantidad</Text>
            <Text style={styles.colUnidad}>Unidad</Text>
            <Text style={styles.colConcepto}>Concepto(s)</Text>
            <Text style={styles.colPrecio}>Precio U</Text>
            {hayDescuento && <Text style={styles.colPrecio}>Descuento</Text>}
            <Text style={styles.colImporte}>Importe</Text>
          </View>

          {/* Filas de esta página */}
          {grupo.map((serv, index) => (
            <View key={index} style={styles.tableRow} >
              <Text style={styles.colProducto}>{serv.servicio?.claveCfdi?.codigo ?? 'sin datos'}</Text>
              <Text style={styles.colCantidad}>{serv.cantidad}</Text>
              <Text style={styles.colUnidad}>{serv?.unidadCfdi?.codigo ?? 'sin datos'} - {serv?.unidadCfdi?.nombre ?? 'sin datos'}</Text>
              <Text style={styles.colConcepto}>
                {serv.servicio.nombre}
                {'\n'}
                2 - Con objeto de impuesto{'\n'}
                Traslados:{'\n'}
                IVA:
                <Text style={styles.textoPequeno}>
                  {`002, Base: ${serv.precioUnitario}, Tasa: ${(parseFloat(dataFactura.valores.ivaPct ?? 0)).toFixed(6)}, Importe: $${(parseFloat(serv.precioUnitario ?? 0) * parseFloat(dataFactura.valores.ivaPct ?? 0)).toFixed(2)}`}
                </Text>
              </Text> 
              <Text style={styles.colPrecio}>${serv.precioUnitario}</Text>
              {hayDescuento && <Text style={styles.colPrecio}>${dataFactura.valores.valorDescuento}</Text>}
              <Text style={styles.colImporte}>${serv.subtotal}</Text>
            </View>
          ))}
        </View>
      ))}


      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
  
          {/* Totales */}
        <View style={{ flex: 1 }}>
          <View >
            <View style={styles.totalRow}>
            
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${dataFactura.valores.subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <View style={styles.shortLine} />
              </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA {`${(100 * parseFloat(dataFactura.valores.ivaPct ?? 0)).toFixed(0)}`}%:</Text>
              <Text style={styles.totalValue}>${dataFactura.valores.ivaValor}</Text>
            </View>
          </View>
        </View>

      </View>

      <View style={styles.section}>
      <View style={styles.separator} />
      <View style={styles.row}>
        <View style={[styles.pairContainer, styles.textoPequeno]}>
          <Text>Moneda: { dataFactura.monedaCodigo} - {dataFactura.monedaDesc}</Text>
        </View>
        <View style={[styles.pairContainer, styles.textoPequeno]}>
          <Text>{centavotext} {centavo} MXN</Text>
        </View>
        
        <View style={[styles.pairContainer]}>
        <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${dataFactura.valores.totalFinal}</Text>
            </View>
        </View>
      </View>
      </View>
      <View style={styles.separator} />
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={{ width: '25%' }}>
            <Text style={styles.textLabel}>Forma de Pago:</Text>
            <Text>{dataFactura.formaPagoCodigo} - {dataFactura.formaPago}</Text>
          </View>
          <View style={{ width: '25%' }}>
            <Text style={styles.textLabel}>Método de Pago:</Text>
            <Text>{dataFactura.metodoPago} - {dataFactura.metodoPagoDesc}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.pagefooder} fixed>Este documento NO es una representación impresa de un CFDI 4.0</Text>
      {/* Información adicional 
      <View style={styles.section}>
        <View style={styles.row}>
          
          <Text style={styles.col}>Forma de Pago: 99 - Por definir</Text>
        </View>
        <Text>Método de Pago: PPD - Pago en parcialidades ó diferido</Text>
       
      </View>*/}

      

      {/* Totales 
      <View style={styles.totalSection}>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>$100.00</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA 16%:</Text>
          <Text style={styles.totalValue}>$16.00</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>$116.00</Text>
        </View>
      </View>*/}
    </Page>
  </Document>

  );
  // Datos de ejemplo para la tabla
};

export default FacturaPDF;