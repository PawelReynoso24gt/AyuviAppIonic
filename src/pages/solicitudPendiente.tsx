import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg } from '@ionic/react';
import solicitudPendienteImg from '../img/ayuvi1.jpeg';

const SolicitudPendiente: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: '#6A5ACD' }}>
          <IonTitle style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>
            Solicitud Pendiente
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(45deg, #E6E6FA, #F0F8FF)',
          minHeight: '100vh',
        }}
      >
        {/* Imagen principal */}
        <IonImg
          src={solicitudPendienteImg}
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '400px',
            marginTop: '30px',
            width: '100%',
            height: 'auto',
            borderRadius: '15px',
            boxShadow: '0 15px 20px rgba(159, 19, 224, 0.3)',
          }}
        />

        {/* Mensaje de solicitud */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 'bold',
              color: '#4B0082',
              marginBottom: '10px',
            }}
          >
            Su solicitud ha sido enviada
          </h1>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#4B0082',
              marginBottom: '20px',
            }}
          >
            Por el momento la aceptación de la misma está pendiente...
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            Para cualquier información adicional, por favor llame al{' '}
            <a href="tel:+50212345678" style={{ color: '#007AC3', fontWeight: 'bold' }}>
              +502 1234 5678
            </a>{' '}
            o escriba al correo{' '}
            <a href="mailto:info@example.com" style={{ color: '#FF4500', fontWeight: 'bold' }}>
              info@example.com
            </a>
            .
          </p>
        </div>

        {/* Botón para volver al inicio */}
        <IonButton
          expand="block"
          style={{
            background: 'linear-gradient(45deg, rgb(137, 223, 131), #2b9224)',
            color: 'white',
            fontWeight: 'bold',
            margin: '30px auto', // Centrado horizontal con margen superior
            padding: '10px',
            fontSize: '18px',
            width: '300px',
          }}
          routerLink="/inicio"
        >
          VOLVER AL INICIO
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudPendiente;
