export const generarPlantillaHTML = (data) => {
  const {
    org = "INADE - Instituto Nacional de Análisis y Diagnóstico Ecológico",
    logo_url = "https://via.placeholder.com/150x60?text=LOGO",
    marca = "https://via.placeholder.com/800x600?text=Marca+de+Agua",
    cliente = {},
    cotizacion = {},
    formato = {},
    tituloDocumento
  } = data;

  const clienteFinal = {
    titulo: cliente.titulo || "Ing.",
    nombre: cliente.nombre || "Juan Perez Lopez",
    empresa: cliente.empresa || "ESCUELA KEMPER URGATE",
    division: cliente.division || "2",
    direccion:
      cliente.direccion || "Calle Natura, 19376, Natura, Tijuana, Baja California, CP: 42501",
    telefono: cliente.telefono || "1234567890",
    correo: cliente.correo || "1234567890",
  };

  const conceptos = cotizacion.conceptos || [
    {
      nombre: "Iluminacion",
      descripcion: "Descripcion de iluminacion",
      metodo: "NOM-024-STPS-2001",
      cantidad: 1,
      precio: "1,213.00",
      subtotal: "1,213.00",
    },
    {
      nombre: "Cajar167",
      descripcion: "Descripcion de cajar167",
      metodo: "NOM-025-STPS-2008",
      cantidad: 6,
      precio: "1,000.00",
      subtotal: "6,000.00",
    },
  ];

  const mostrarFormato =
    formato.nombreFormato || formato.version || formato.fechaEmision;

     return `
     <!DOCTYPE html>
     <html lang="es">
     <div class="marca-agua"></div>
     <head>
     <meta charset="UTF-8">
     <title>Cotización de Servicios</title>
     <style>
     .uppercase { text-transform: uppercase; }

     .marca-agua {
     position: fixed;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
     width: 80%;
     height: 80%;
     background: url("${marca}") no-repeat center center;
     background-size: contain;
     opacity: 0.15;       /* transparencia ajustable */
     z-index: -1;         /* se coloca detrás de todo el contenido */
     pointer-events: none; /* evita interferir con clics o selección */
     }


     body {
     font-family: Arial, sans-serif;
     font-size: 14px;
     line-height: 1.6;
     margin: 0;
     padding: 0;
     position: relative;
     }

     header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 0 20px;
     border-bottom: 2px solid #ddd;
     font-size: 14px;
     }

     header img {
     max-width: 120px;
     }

     header .center {
     flex-grow: 1;
     text-align: center;
     }

     header .right {
     text-align: right;
     }

     h3 {
     text-align: center;
     margin: 18px 0;
     font-size: 18px;
     }

     table {
     width: 100%;
     border-collapse: collapse;
     margin-top: 20px;
     border: 1px solid #000;
     }

     th, td {
     border: 1px solid #000;
     padding: 8px;
     vertical-align: top;
     }

     th {
     background-color: #f5f5f5;
     }

     .info {
     display: flex;
     justify-content: space-between;
     margin: 10px 20px;
     }

     .totals {
     margin-top: 20px;
     text-align: right;
     }

     .totals p {
     margin: 5px 0;
     }

     footer {
     position: fixed;
     left: 0;
     right: 0;
     text-align: center;
     font-size: 12px;
     color: #666;
     border-top: 1px solid #ddd;
     }

     .page-break {
     page-break-before: always;
     }

     .texto-justificado {
     text-align: justify;
     white-space: pre-wrap;
     word-break: break-word;
     font-size: 14px;
     line-height: 1.4;
     margin: 20px;
     }

     .mensajefinal {
     margin-top: 30px;
     text-align: center;
     }

     .signature-container {
     margin-top: 60px;
     text-align: center;
     }

     .signature-line {
     margin: 80px auto 0;
     border-top: 1px solid #000;
     width: 250px;
     }

     .signature-name {
     margin-top: 5px;
     font-size: 12px;
     color: #555;
     text-align: center;
     }

     </style>
     </head>
     <body>
     <header>
     <div class="logo"><img src="${logo_url}" alt="Logo"></div>
     <div class="center">
          <p><strong class="uppercase">${org}</strong></p>
          <p class="uppercase">COTIZACION DE SERVICIOS</p>
     </div>
     <div class="right">
          ${
          mostrarFormato
               ? `
          ${formato.nombreFormato ? `<p><strong>${formato.nombreFormato}</strong></p>` : ""}
          ${formato.version ? `<p><strong>Versión:</strong> ${formato.version}</p>` : ""}
          ${formato.fechaEmision ? `<p><strong>Emisión:</strong> ${formato.fechaEmision}</p>` : ""}
          `
               : ""
          }
     </div>
     </header>

     <h3>${tituloDocumento}</h3>

     <div class="info">
     <div>
          <p><strong>Atención:</strong> ${clienteFinal.titulo} ${clienteFinal.nombre}</p>
          <p>${clienteFinal.empresa} División: ${clienteFinal.division}</p>
          <p>${clienteFinal.direccion}</p>
     </div>
     <div style="text-align:right;">
          <p><strong>Número de cotización:</strong> ${cotizacion.numero || "3"}</p>
          <p><strong>Fecha de elaboración:</strong> ${cotizacion.fecha || "2025/11/03"}</p>
          <p><strong>Teléfono:</strong> ${clienteFinal.telefono}</p>
          <p><strong>Correo:</strong> ${clienteFinal.correo}</p>
     </div>
     </div>

     <p style="margin:0 20px;">
     Gracias por la oportunidad de presentar nuestra propuesta. Por favor revise que se cumple con sus requerimientos; en caso contrario, comuníquese con nosotros.
     </p>

     <table>
     <thead>
          <tr>
          <th>Partida</th>
          <th>Concepto</th>
          <th>Método</th>
          <th>Cant.</th>
          <th>Precio Unitario</th>
          <th>Subtotal</th>
          </tr>
     </thead>
     <tbody>
          ${conceptos
          .map(
               (c, i) => `
          <tr>
               <td style="text-align:center;">${i + 1}</td>
               <td><strong>${c.nombre}</strong><br>${c.descripcion}</td>
               <td>${c.metodo}</td>
               <td style="text-align:center;">${c.cantidad}</td>
               <td>${c.precio}</td>
               <td>${c.subtotal}</td>
          </tr>`
          )
          .join("")}
     </tbody>
     </table>

     <div class="totals" style="margin-right:20px;">
     <p><strong>Subtotal:</strong> MXN ${cotizacion.subtotal || "7,213.00"}</p>
     <p><strong>Descuento:</strong> MXN ${cotizacion.descuento || "0.00"}</p>
     <p><strong>Subtotal con descuento:</strong> MXN ${cotizacion.subtotal_descuento || "7,213.00"}</p>
     <p><strong>IVA:</strong> MXN ${cotizacion.iva || "1,154.08"}</p>
     <p><strong>Total:</strong> MXN ${cotizacion.total || "8,367.08"}</p>
     </div>

     <!-- 🔹 Página 2: Términos -->
     <div class="page-break"></div>
     <header>
     <div class="logo">
          <img src="${logo_url}" alt="Logo">
     </div>
     <div class="center">
          <p class="organization-name"><strong>${org}</strong></p>
          <p>COTIZACION DE SERVICIOS</p>
     </div>
     <div class="right">
          ${formato.nombreFormato ? `<p><strong>${formato.nombreFormato}</strong></p>` : ""}
          ${formato.version ? `<p><strong>Versión:</strong> ${formato.version}</p>` : ""}
          ${formato.fechaEmision ? `<p><strong>Emisión:</strong> ${formato.fechaEmision}</p>` : ""}
     </div>
     </header>

     <p class="texto-justificado">${data.terminos || "Aquí irán los términos generales de la cotización."}</p>
          <br></br>

     <!-- 🔹 Página 3: Avisos y firma -->
     <div class="page-break"></div>
     <header>
     <div class="logo">
          <img src="${logo_url}" alt="Logo">
     </div>
     <div class="center">
          <p class="organization-name"><strong>${org}</strong></p>
          <p>COTIZACION DE SERVICIOS</p>
     </div>
     <div class="right">
          ${formato.nombreFormato ? `<p><strong>${formato.nombreFormato}</strong></p>` : ""}
          ${formato.version ? `<p><strong>Versión:</strong> ${formato.version}</p>` : ""}
          ${formato.fechaEmision ? `<p><strong>Emisión:</strong> ${formato.fechaEmision}</p>` : ""}
     </div>
     </header>

     <p class="texto-justificado">${data.avisos || "Aquí irán los avisos legales o condiciones adicionales."}</p>

     <p class="mensajefinal">En caso de aceptación, favor de enviar su cotización firmada.</p>

     <p >Elaboró: ${data.usuario || "Administrador del sistema"}</p>
     <p >Fecha de caducidad: ${cotizacion.fecha_caducidad || "N/A"}</p>

     <div class="signature-container">
     <div class="signature-line"></div>
     <div class="signature-name">
          Firma del cliente ${clienteFinal.titulo || ""} ${clienteFinal.nombre || ""}
     </div>
     </div>

     <footer>
     Blvd. Industrial 123, Tijuana, B.C. | (664) 555-0000 | www.inade.com.mx
     </footer>
     </body>
     </html>
     `;
};
