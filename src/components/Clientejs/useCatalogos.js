// src/hooks/useCatalogos.js
import { useState, useEffect } from "react";
import { getAllRegimenFiscal } from "../../apis/Regimenfiscla";
import { getAllEmpresas } from "../../apis/EmpresaApi";
import { getAllUsoCDFI } from "../../apis/UsocfdiApi";

export const useCatalogos = (organizationId) => {
  const [regimenFiscal, setRegimenFiscal] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [usosCfdi, setUsosCfdi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        setLoading(true);
        const [regimenRes, empresasRes, usosCfdiRes] = await Promise.all([
          getAllRegimenFiscal(),
          getAllEmpresas(),
          getAllUsoCDFI(),
        ]);
        setRegimenFiscal(regimenRes.data);
        // Filtrar las empresas según el ID de la organización
        const filteredEmpresas = empresasRes.data.filter(
          (empresa) => empresa.organizacion === organizationId
        );
        setEmpresas(filteredEmpresas);
        setUsosCfdi(usosCfdiRes.data);
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchCatalogos();
    }
  }, [organizationId]);

  return { regimenFiscal, empresas, usosCfdi, loading };
};
