import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { IonApp, IonMenu, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Profile from './pages/PerfilUsuario';
import ChangePassword from './pages/ChangePassword';
import PrivateRoute from '../src/components/PrivateRoute';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const handleLogout = () => {
    // Borra el localStorage
    localStorage.clear();
    // Redirige al usuario a la página de login
    window.location.href = '/login'; // Redirige a la página de login
  };

  return (
    <IonApp>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink="/home">Inicio</IonItem>
            <IonItem routerLink="/about">Acerca de</IonItem>
            <IonItem routerLink="/profile">Perfil</IonItem>
            <IonItem button onClick={handleLogout}>Cerrar sesión</IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
      <Router>
        <IonRouterOutlet id="main-content">
          <Switch>
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/home" component={Home} />
            <PrivateRoute exact path="/about" component={About} />
            <PrivateRoute exact path="/profile" component={Profile} />
            <PrivateRoute exact path="/change-password" component={ChangePassword} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
            <Route path="*">
              <Redirect to="/login" />
            </Route>
          </Switch>
        </IonRouterOutlet>
      </Router>
    </IonApp>
  );
};

export default App;