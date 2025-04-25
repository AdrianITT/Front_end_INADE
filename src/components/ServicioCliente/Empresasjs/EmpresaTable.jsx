// EmpresaTable.jsx
import React, { useRef, useState } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const EmpresaTable = ({ dataSource, onEdit, onDelete }) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  // Lógica de búsqueda
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  // Column helper
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ 
      setSelectedKeys, 
      selectedKeys, 
      confirm, 
      clearFilters, 
      close 
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Buscar ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => {
              if (clearFilters) handleReset(clearFilters);
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reiniciar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filtrar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Cerrar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // Columnas
  const columns = [
    {
      title: '#',
      dataIndex: 'numero',
      key: 'numero',
      width: '5%',
    },
    {
      title: 'Empresa',
      dataIndex: 'Empresa',
      key: 'Empresa',
      width: '20%',
      ...getColumnSearchProps('Empresa'),
    },
    {
      title: 'RFC',
      dataIndex: 'RFC',
      key: 'RFC',
      width: '10%',
      ...getColumnSearchProps('RFC'),
    },
    {
      title: 'Direccion',
      dataIndex: 'Direccion',
      key: 'Direccion',
      width: '30%',
      ...getColumnSearchProps('Direccion'),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            onClick={() => onEdit(record.key)}
            style={{ marginRight: 4 }}
          >
            <EditOutlined />
          </Button>
          <Button type="danger" onClick={() => onDelete(record.key)}
               style={{
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    color: '#fff'
                  }}>
            <CloseOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={{ pageSize: 5 }}
      rowKey="key"
      bordered
      // Agregamos una clase a las filas con datos incompletos
      rowClassName={(record) => (record.incompleta ? 'fila-incompleta' : '')}
    />
  );
};

export default EmpresaTable;
