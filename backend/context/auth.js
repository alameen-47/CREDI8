import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {createContext, useEffect, useState} from 'react';
import {setApiAuthToken} from '../../frontend/services/api.js';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const navigation = useNavigation();
  const [auth, setAuth] = useState({
    user: null,
    token: null,
  });

  useEffect(() => {
    setApiAuthToken(auth?.token);
  }, [auth?.token]);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        if (data) {
          const parseData = JSON.parse(data);
          setAuth({
            user: parseData.user,
            token: parseData.token,
          });
          navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
        } else {
          navigation.reset({index: 0, routes: [{name: 'LogIn'}]});
        }
      } catch (error) {
        console.error('Error loading auth data: ', error);
      }
    };
    loadAuthData();
  }, [navigation]);

  const saveAuthData = async (user, token) => {
    try {
      const authData = {user, token};
      await AsyncStorage.setItem('user', JSON.stringify(authData));
      setAuth(authData);
      setApiAuthToken(token);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const removeAuthData = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setAuth({user: null, token: null});
      setApiAuthToken(null);
    } catch (error) {
      console.error('Error removing auth data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{auth, setAuth, saveAuthData, removeAuthData}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
