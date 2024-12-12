import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import './About.css';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div id="about-container">
          <strong>Bienvenido a la Página About</strong>
          <p>Explora más sobre Ionic y sus increíbles componentes de <a href="https://ionicframework.com/docs/components" target="_blank" rel="noopener noreferrer">UI Components</a>.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;
