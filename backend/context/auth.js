import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {createContext, useEffect, useState} from 'react';

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const navigation = useNavigation();

  const [auth, setAuth] = useState({
    user: null,
    token: null,
  });

  // Set Authorization header globally
  axios.defaults.headers.common['Authorization'] = auth?.token;

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
          navigation.navigate('HomeScreen');
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error Loading auth data: ', error);
      }
    };

    // 🔹 Effect runs when the component mounts to retrieve auth data
    loadAuthData();
  }, []);

  // 🔹 Function to save auth data in AsyncStorage when logging in
  const saveAuthData = async (user, token) => {
    try {
      const authData = {user, token};
      await AsyncStorage.setItem('user', JSON.stringify(authData)); // Save data
      setAuth(authData); // Update state
      axios.defaults.headers.common['Authorization'] = token; // Set Axios token
      // 🔥 Debugging: Fetch and log stored data
      const storedData = await AsyncStorage.getItem('user');
      console.log(
        '****\\\\\\***** Stored Auth Data ****\\\\\\****:',
        storedData,
      );
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  // 🔹 Function to remove auth data (logout)
  const removeAuthData = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Remove auth data from storage
      setAuth({user: null, token: null}); // Reset state
      delete axios.defaults.headers.common['Authorization']; // Remove token from Axios
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
