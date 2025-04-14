import React from 'react';
import { Input, Tooltip } from 'antd';

export const NumericInput = ({ value, onChange, style }) => {
  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    if (!value || typeof value !== 'string') return; // validación de seguridad
  
    let valueTemp = value;
  
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1);
    }
  
    onChange(valueTemp.replace(/0*(\d+)/, '$1'));
  };
  

  const title = value ? (
    <span>{value !== '-' ? new Intl.NumberFormat().format(Number(value)) : '-'}</span>
  ) : (
    'Ingresa un número'
  );

  return (
    <Tooltip title={title} trigger={['focus']}>
      <Input
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Ingresa un número"
        maxLength={16}
        value={value}
        style={style}
      />
    </Tooltip>
  );
};
