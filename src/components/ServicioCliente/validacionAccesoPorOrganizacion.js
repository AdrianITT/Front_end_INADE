import { message} from "antd";
export const validarAccesoPorOrganizacion = async ({
     fetchFunction,
     organizationId,
     id,
     campoId = "id",
     navigate,
     navigatePath = "/no-autorizado",
     mensajeError = "No tienes autorización para editar este recurso.",
   }) => {
     try {
       const response = await fetchFunction(organizationId);
       console.log("response",response);
       const idsPermitidos = response.data.map((c) => {
          if (typeof campoId === "function") {
            return String(campoId(c));
          } else {
            return String(c[campoId]);
          }
        });
       //console.log("idsPermitidos",idsPermitidos);
       if (idsPermitidos.length > 0 && !idsPermitidos.includes(String(id))) {
         message.error(mensajeError);
         navigate(navigatePath);
         return false;
       }
   
       return true;
     } catch (error) {
       console.error("Error al validar acceso:", error);
       message.error("Error al validar permisos.");
       navigate(navigatePath);
       return false;
     }
   };
   