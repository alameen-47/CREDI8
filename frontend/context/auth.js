import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {createContext, useEffect, useRef, useState} from 'react';
import {setApiAuthToken, registerUnauthorizedHandler} from '../services/api.js';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const navigation = useNavigation();
  const [auth, setAuth] = useState({user: null, token: null});
  // Track whether the initial load has completed (avoids race on fast rerender)
  const initialised = useRef(false);

  // Register a global 401 handler so the Axios interceptor can force logout
  // without importing AuthContext (would be a circular dep).
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      removeAuthDataRef.current?.();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a stable ref to removeAuthData so the handler above always calls
  // the latest version even before the function is defined below.
  const removeAuthDataRef = useRef(null);

  // Keep Axios auth header in sync whenever the token changes
  useEffect(() => {
    setApiAuthToken(auth?.token ?? null);
  }, [auth?.token]);

  // Restore persisted session on mount
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const loadAuthData = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const {user, token} = JSON.parse(raw);
          setAuth({user, token});
          navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
        } else {
          navigation.reset({index: 0, routes: [{name: 'LogIn'}]});
        }
      } catch (err) {
        // Corrupted storage — clear and send to login
        await AsyncStorage.removeItem('user').catch(() => {});
        navigation.reset({index: 0, routes: [{name: 'LogIn'}]});
      }
    };

    loadAuthData();
  }, [navigation]);

  const saveAuthData = async (user, token) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify({user, token}));
      setAuth({user, token});
      setApiAuthToken(token);
    } catch (err) {
      // Storage write failed — still update in-memory state so session works
      setAuth({user, token});
      setApiAuthToken(token);
    }
  };

  const removeAuthData = async () => {
    try {
      await AsyncStorage.removeItem('user');
    } catch {
      // Ignore storage errors on logout
    } finally {
      setAuth({user: null, token: null});
      setApiAuthToken(null);
      navigation.reset({index: 0, routes: [{name: 'LogIn'}]});
    }
  };

  // Keep ref in sync so the 401 handler always has the latest version
  removeAuthDataRef.current = removeAuthData;

  return (
    <AuthContext.Provider value={{auth, setAuth, saveAuthData, removeAuthData}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
