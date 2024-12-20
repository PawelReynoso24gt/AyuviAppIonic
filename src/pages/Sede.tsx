import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonText,
  IonLoading,
  IonImg,
} from '@ionic/react';
import axios from '../services/axios'; // Instancia de Axios
import { getInfoFromToken } from '../services/authService';

const Sede: React.FC = () => {
  const [sedeData, setSedeData] = useState<any>(null);
  const [fotosSede, setFotosSede] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSedeData = async () => {
      try {
        // Obtener el idSede desde el token
        const tokenInfo = getInfoFromToken();
        if (!tokenInfo || !tokenInfo.idSede) {
          throw new Error('No se pudo obtener el ID de la sede desde el token.');
        }
  
        // Obtener los detalles de la sede usando el idSede
        const sedeResponse = await axios.get(`/sedes/${tokenInfo.idSede}`);
        setSedeData(sedeResponse.data);
  
        // Obtener las fotos de la sede
        const fotosResponse = await axios.get(`/fotos_sedes/${tokenInfo.idSede}`);
        setFotosSede(fotosResponse.data);
      } catch (err) {
        setError('Error al cargar la información de la sede.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchSedeData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sede</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <IonLoading isOpen={loading} message="Cargando..." />
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : sedeData ? (
          <>
            {/* Nombre de la Sede */}
            <IonText
              color="primary"
              style={{
                textAlign: 'center',
                fontSize: '30px',
                fontWeight: 'bold',
                display: 'block',
                marginBottom: '20px',
              }}
            >
              {sedeData.nombreSede}
            </IonText>

            {/* Información */}
            <IonTitle style={{ textAlign: 'center', marginTop: '20px', fontSize: '25px', marginBottom: '20px', }}>Información</IonTitle>
            <IonText
              style={{
                textAlign: 'justify',
                margin: '10px 20px',
                fontSize: '15px'
                
              }}
            >
              {sedeData.informacion}
            </IonText>

            {/* Fotos de la Sede */}
            <IonTitle style={{ textAlign: 'center', marginTop: '20px' }}>Fotos de la Sede</IonTitle>
            {fotosSede.length > 0 ? (
              <IonList>
                {fotosSede.map((foto: any) => (
                  <IonItem key={foto.idFotoSede}>
                    <IonAvatar>
                      <IonImg src={foto.foto} alt={`Foto de la sede ${foto.idFotoSede}`} />
                    </IonAvatar>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <IonText
                color="medium"
                style={{
                  textAlign: 'center',
                  marginTop: '20px',
                  display: 'block',
                }}
              >
                No hay fotos disponibles para esta sede.
              </IonText>
            )}
          </>
        ) : (
          <IonText color="danger" style={{ textAlign: 'center' }}>
            No se encontraron datos de la sede.
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Sede;
