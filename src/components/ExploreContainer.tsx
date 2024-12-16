import React, { useEffect, useState } from 'react';
import { getInfoFromToken } from '../services/authService'; // Ajusta la ruta según tu proyecto
import './ExploreContainer.css';

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Obtener el ID del usuario del token
    const id = getInfoFromToken();
    setUserId(id);
  }, []);

  return (
    <div id="container">
      {userId ? (
        <p>
          HOLA USUARIO CON ID: <strong>{userId}</strong>
        </p>
      ) : (
        <p>No se pudo obtener el ID del usuario.</p>
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
