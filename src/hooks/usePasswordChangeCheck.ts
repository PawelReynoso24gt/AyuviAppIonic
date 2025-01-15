// hooks/usePasswordChangeCheck.js
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from '../services/axios'; // Asegúrate de que la ruta sea correcta
import { isAxiosError } from 'axios';

const usePasswordChangeCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const checkPasswordChange = async () => {
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
  }, [history]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return { showModal, message, daysRemaining, handleCloseModal };
};

export default usePasswordChangeCheck;