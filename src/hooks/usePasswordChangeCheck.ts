import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from '../services/axios'; // Asegúrate de que la ruta sea correcta
import { isAxiosError } from 'axios';

const usePasswordChangeCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const checkPasswordChange = async () => {
      const excludedPaths = ['/login', '/registroAspirante', '/solicitudPendiente'];
      if (excludedPaths.includes(location.pathname)) {
        return; // No realizar la solicitud si estamos en una de las rutas excluidas
      }

      try {
        const response = await axios.get("/usuarios/verify", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const { changedPassword, message, daysRemaining } = response.data;

        if (changedPassword === 0) {
          setMessage(message || "Necesitas cambiar tu contraseña.");
          setDaysRemaining(daysRemaining);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error al verificar el estado de la contraseña:", error);
        if (isAxiosError(error) && error.response && error.response.status === 403) {
          // Eliminar el token y redirigir al login
          localStorage.removeItem("token");
          history.push("/login");
        }
      }
    };

    checkPasswordChange();
  }, [history, location]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return { showModal, message, daysRemaining, handleCloseModal };
};

export default usePasswordChangeCheck;