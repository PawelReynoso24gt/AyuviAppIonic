import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonMenu, IonList, IonItem, IonMenuButton, IonButtons, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import Home from './pages/Home';
import About from './pages/About';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark Mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <Router>
      {/* Menu de Hamburguesa */}
      <IonMenu side="start" menuId="firstMenu" contentId="main">
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Menú</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem button routerLink="/home">Home</IonItem>
            <IonItem button routerLink="/about">About</IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Botón de Menú en la Barra de Herramientas */}
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton menu="firstMenu"></IonMenuButton>
          </IonButtons>
          <IonTitle>AYUVI</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonRouterOutlet id="main">
        <Route exact path="/home" component={Home} />
        <Route exact path="/about" component={About} />
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </Router>
  </IonApp>
);

export default App;
