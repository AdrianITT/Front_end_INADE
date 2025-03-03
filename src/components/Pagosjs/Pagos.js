import React from "react";
import { Table, Button } from "antd";
import { Link } from "react-router-dom";

const Pagos=()=>{
     const dataSource=[
          {key:'1', nombre:'pago 1', monto:'$200'},
          {key:'2', nombre:'pago 2', monto:'$300'}
     ]

     const columns = [
          { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
          { title: 'Monto', dataIndex: 'monto', key: 'monto' },
     ];
     return (
          <>
                    <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px'
            }}
          >
            <h1 style={{ textAlign: 'center' }}>Comprobantes de Pagos</h1>
            <Link to="/CrearPagos">
            <Button type="primary" style={{ marginBottom: '20px' }}>
              Nuevo Pago
            </Button></Link>
            <div style={{ width: '80%' }}>
              <Table dataSource={dataSource} columns={columns} />
            </div>
          </div>
          </>
        );
}
export default Pagos;