// import CryptoJS from "crypto-js"
// const SECRET_KEY = "f#83Dd@9!Trm8vJq*";

// export const cifrarId = (id) => {
//      return CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString();
//    };

// export const descifrarId = (texto) => {
// try {
//      const bytes = CryptoJS.AES.decrypt(texto, SECRET_KEY);
//      const id = bytes.toString(CryptoJS.enc.Utf8);

//      if (!id) throw new Error("ID vacío o no válido");

//      return id;
// } catch (error) {
//      console.error("Error al descifrar ID:", error);
//      return null;
// }
// };


// Cifrar un ID u otro texto
export const cifrarId = (textoPlano) => {
     return btoa(String(textoPlano)); // convierte a base64
   };
   
   // Descifrar
   export const descifrarId = (textoCifrado) => {
     try {
       return atob(textoCifrado); // vuelve a texto normal
     } catch (error) {
       console.error("Error al descifrar:", error);
       return null;
     }
   };
   