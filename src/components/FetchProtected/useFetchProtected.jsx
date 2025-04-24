// src/hooks/useProtectedApi.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * hook genérico para cualquier llamada a tu API wrapper (axios).
 * @param {Function} apiFn – función que devuelve una promesa, p.ej. getDetallecotizaciondataById
 * @param {...any} args – argumentos que hay que pasarle a apiFn
 */
export function useProtectedApi(apiFn, ...args) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const navigate             = useNavigate();

  useEffect(() => {
    let mounted = true;

    apiFn(...args)
      .then(res => {
        if (mounted) {
          setData(res.data);
        }
      })
      .catch(err => {
        // si recibes un axiosError, mira err.response.status
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          navigate("/no-autorizado", { replace: true });
        } else if (mounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [apiFn, JSON.stringify(args), navigate]);

  return { data, loading, error };
}
