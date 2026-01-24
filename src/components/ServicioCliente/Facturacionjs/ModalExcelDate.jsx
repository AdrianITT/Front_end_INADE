import React, { useEffect, useState } from "react";
import { Modal, DatePicker, Space, Button, message  } from "antd";
import {downloadExcelFacturas} from "../../../apis/ApisServicioCliente/FacturaApi";
const { RangePicker } = DatePicker;

export default function ModalExcelDate({org,  openExcel, onClose }){
     const [range, setRange] = useState(null);
     const [loading, setLoading] = useState(false);

     const handleSearch = async ()=>{
          if(!range || !range[0] || !range[1]){
               message.warning("seleciona un rango de fecha.");
               return;
          }

          const from = range[0].format("YYYY-MM-DD");
          const to = range[1].format("YYYY-MM-DD");
          try{
               setLoading(true);
               const res = await downloadExcelFacturas(org,from, to);
                   // 2) Definir nombre del archivo (si Django lo manda, lo usamos)
               const disposition = res.headers["content-disposition"] || "";
               const match = disposition.match(/filename="(.+?)"/);
               const filename = match?.[1] || `facturas_${org}_${from}_${to}.xlsx`;

               // 3) Crear el archivo en memoria
               const blob = new Blob([res.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
               });

               // 4) Forzar la descarga en el navegador
               const url = window.URL.createObjectURL(blob);
               const link = document.createElement("a");
               link.href = url;
               link.download = filename;
               document.body.appendChild(link);
               link.click();

               // 5) Limpieza
               link.remove();
               window.URL.revokeObjectURL(url);

               onClose?.();

          }catch(error){
               message.error("No se pudo descargar el Excel")
          }finally{
               setLoading(false);
          }

     }
     
     return(
          <>
          <Modal
          open={openExcel}
          onCancel={onClose}
          footer={null}
          destroyOnClose
          >
               <Space vertical size={12}>
                    <RangePicker 
                    value={range}
                    onChange={(values) => setRange(values)}
                    />
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button onClick={onClose}>Cerrar</Button>
                    <Button type="primary" loading={loading} onClick={handleSearch}>
                         Consultar
                    </Button>
                    </div>
               </Space>
          </Modal>
          </>
     );
}