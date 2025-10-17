import dayjs from "dayjs";

export const calcularTotales = ({ conceptos, descuento, tipoCambioDolar, tipoMoneda, ivaPct }) => {
  const subtotal = conceptos.reduce(
    (acc, curr) => acc + (Number(curr.cantidad || 0) * Number(curr.precioFinal || 0)),
    0
  );

  const descuentoSeguro = Number(descuento || 0) / 100;
  const descuentoValor = subtotal * descuentoSeguro;
  const subtotalConDescuento = subtotal - descuentoValor;

  const iva = subtotalConDescuento * (ivaPct || 0.16);
  const total = subtotalConDescuento + iva;

  const factorConversion = Number(tipoMoneda === 2 ? tipoCambioDolar : 1) || 1;

  return {
    subtotal: +(subtotal ).toFixed(3),
    descuentoValor: +(descuentoValor ).toFixed(3),
    subtotalConDescuento: +(subtotalConDescuento).toFixed(3),
    iva: +(iva ).toFixed(3),
    total: +(total).toFixed(3),
    // subtotal: +(subtotal / factorConversion).toFixed(3),
    // descuentoValor: +(descuentoValor / factorConversion).toFixed(3),
    // subtotalConDescuento: +(subtotalConDescuento / factorConversion).toFixed(3),
    // iva: +(iva / factorConversion).toFixed(3),
    // total: +(total / factorConversion).toFixed(3),
  };
};

export const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");

export const getMonedaTexto = (id) => (id === 2 ? "USD" : "MXN");
