// hooks/usePasswordChangeCheck.js
import { useState, useEffect } from 'react';
import axios from '../services/axios'; // Asegúrate de que la ruta sea correcta

const usePasswordChangeCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);

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
      }
    };

    checkPasswordChange();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return { showModal, message, daysRemaining, handleCloseModal };
};

export default usePasswordChangeCheck;