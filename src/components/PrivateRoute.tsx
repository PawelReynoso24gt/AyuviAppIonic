import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

interface PrivateRouteProps {
    component: React.ComponentType<any>;
    path: string;
    exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
    const [auth, setAuth] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const result = await isAuthenticated();
                setAuth(result);
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                setAuth(false); // Asume no autenticado en caso de error
            }
        };
    
        checkAuth();
    }, []);    

    if (auth === null) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
                <h3>Verificando autenticación...</h3>
            </div>
        ); // Loader temporal
    }     // Puedes mostrar un loader aquí mientras verifica

    return auth ? <Route {...rest} render={(props) => <Component {...props} />} /> : <Redirect to="/login" />;
};

export default PrivateRoute;
