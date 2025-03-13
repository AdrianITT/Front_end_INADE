import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Verifica si hay un token en el localStorage
  const userRole = localStorage.getItem('rol'); // Obtiene el rol del usuario
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si el usuario es AdministradorOrganizacion (rol 3), puede acceder a todas las pantallas de UsuarioOrganizacion (rol 2)
  if (userRole === 'Administradororganizacion') {
    return children;
  }

  // Si el usuario no tiene el rol permitido, redirige según su rol
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'Administrador' ? '/Homeadmin' : '/home'} state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;