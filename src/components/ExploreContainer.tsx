import React, { useEffect, useState } from 'react';
import { getInfoFromToken } from '../services/authService';
import './ExploreContainer.css';

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Obtener solo el nombre del usuario
    const info = getInfoFromToken();
    if (info?.usuario) {
      setUsername(info.usuario); // Guardar solo el nombre del usuario
    }
  }, []);

  return (
    <div id="container">
      {username ? (
        <p>
          Bienvenido <strong>{username}</strong>
        </p>
      ) : (
        <p>No se pudo obtener el nombre del usuario.</p>
      )}
      <p>
        Start with Ionic{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://ionicframework.com/docs/components"
        >
          UI Components
        </a>
      </p>
    </div>
  );
};

export default ExploreContainer;
