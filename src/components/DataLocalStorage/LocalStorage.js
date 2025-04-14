import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const VerificarExpiracionLocalStorage = () => {
  const location = useLocation();

  useEffect(() => {
     const verificar = () => {
       const ahora = Date.now();
       const expiraEn = parseInt(localStorage.getItem("expiraEn"), 1);
   
       if (!isNaN(expiraEn) && ahora >= expiraEn) {
         const clavesABorrar = ["ordenes_trabajo_state"];
         clavesABorrar.forEach((clave) => localStorage.removeItem(clave));
         localStorage.removeItem("expiraEn");
         console.log("Datos expirados eliminados por temporizador.");
       }
     };
   
     verificar(); // primera verificación inmediata
   
     const intervalo = setInterval(verificar, 10000); // cada 10 segundos
   
     return () => clearInterval(intervalo);
   }, []);
   

  return null;
};

export default VerificarExpiracionLocalStorage;
