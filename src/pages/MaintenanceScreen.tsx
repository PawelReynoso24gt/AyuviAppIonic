import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import './MaintenanceScreen.css';
import maintenanceImg from '../img/MaintenanceImage.png'; // ajusta la ruta si difiere

const MaintenanceScreen: React.FC = () => {
    return (
        <IonPage>
            <IonContent className="maintenance-page" fullscreen>
                <div className="maintenance-container">
                    <img
                        src={maintenanceImg}
                        alt="Mantenimiento"
                        className="maintenance-image"
                    />
                    <div className="maintenance-text">
                        <h1 className="maintenance-emoji">:(</h1>
                        <p></p>
                        <h2 className="maintenance-title">¡Sentimos los inconvenientes!</h2>
                        <h3 className="maintenance-subtitle">
                            Estamos trabajando para brindarte una mejor experiencia.
                        </h3>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MaintenanceScreen;