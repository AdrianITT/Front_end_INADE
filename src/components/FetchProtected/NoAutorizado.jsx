import React, { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NoAutorizado() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Result
      status="403"
      title="403"
      subTitle="Esta página No existe."
      extra={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <Button type="primary" onClick={() => navigate('/home')}>
            Volver al inicio
          </Button>
          <span style={{ color: 'rgba(0,0,0,0.45)' }}>
            Serás redirigido en 4 segundos…
          </span>
        </div>
      }
      style={{ marginTop: 80 }}
    />
  );
}
