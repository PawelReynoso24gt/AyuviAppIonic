import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonMenu, IonList, IonItem, IonMenuButton, IonButtons, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import Home from './pages/Home';
import About from './pages/About';
import axios from './services/axios'; // Importar la instancia para ejecutarla
import Login from './pages/Login';
import PrivateRoute from '../src/components/PrivateRoute';

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
      <IonRouterOutlet>
        <Switch>
          {/* Ruta pública: Página de Login */}
          <Route exact path="/login" component={Login} />
          {/* Rutas privadas protegidas */}
          <PrivateRoute exact path="/home" component={Home} />
          <PrivateRoute exact path="/about" component={About} />
          {/* Redirección por defecto */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          {/* Redirección 404 */}
          <Route path="*">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </IonRouterOutlet>
    </Router>
  </IonApp>
);

export default App;
