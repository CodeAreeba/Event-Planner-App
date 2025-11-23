import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

const RootNavigator: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader fullScreen text="Loading..." />;
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default RootNavigator;
