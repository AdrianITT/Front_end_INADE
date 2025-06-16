import React from "react";

const CotizacionTotales = ({
  subtotal,
  descuentoValor,
  subtotalConDescuento,
  iva,
  total,
  tipoMonedaSeleccionada,
  descuento,
  ivaSeleccionado,
  ivasData,
}) => {
  const moneda = tipoMonedaSeleccionada === 2 ? "USD" : "MXN";
  const ivaPct = ivasData.find((iva) => iva.id === ivaSeleccionado)?.porcentaje || 16;

  return (
    <div className="cotizacion-totals">
      <p>Subtotal: {subtotal.toFixed(6)} {moneda}</p>
      <p>Descuento ({descuento}%): {descuentoValor.toFixed(6)} {moneda}</p>
      <p>Subtotal con descuento: {subtotalConDescuento.toFixed(6)} {moneda}</p>
      <p>IVA ({ivaPct}%): {iva.toFixed(6)} {moneda}</p>
      <p><strong>Total: {total.toFixed(6)} {moneda}</strong></p>
    </div>
  );
};

export default CotizacionTotales;
