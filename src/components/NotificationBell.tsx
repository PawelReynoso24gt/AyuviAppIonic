import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

const NotificationBell: React.FC = () => {
  const history = useHistory();
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userInfo = getInfoFromToken();
        const personId = userInfo?.idPersona;

      try {
        const response = await axios.get(
          `/notificaciones?idPersona=${personId}`
        );

        // Verificar si hay notificaciones y actualizar el estado
        if (response.data.length > 0) {
          setHasNotifications(true);
          // Guardar notificaciones en localStorage para `NotificationsCom`
          localStorage.setItem("notifications", JSON.stringify(response.data));
        } else {
          setHasNotifications(false);
        }
      } catch (error) {
        console.error("Error al obtener las notificaciones:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleIconClick = () => {
    history.push("/notifications"); // Redirigir al componente de notificaciones
  };

  return (
    <div style={{ position: "relative", cursor: "pointer", marginRight: "30px", marginTop: "10px" }} onClick={handleIconClick}>
      <IonIcon icon={notificationsOutline} style={{ fontSize: "30px", color: "white" }} />
      {hasNotifications && (
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "red",
            borderRadius: "50%",
            width: "10px",
            height: "10px",
          }}
        ></span>
      )}
    </div>
  );
};

export default NotificationBell;