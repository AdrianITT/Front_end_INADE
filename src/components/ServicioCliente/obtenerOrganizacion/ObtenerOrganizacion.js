     //import React from "react";

     export function ObtenerOrganizacion(){
          const idOrganizacion=localStorage.getItem("organizacion_id"); // O la forma en la que almacenas el ID de la organización
          return parseInt(idOrganizacion,10);
     };
