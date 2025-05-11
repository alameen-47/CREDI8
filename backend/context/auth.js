// Import AsyncStorage to store data locally on the device
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import navigation hook to move between screens
import {useNavigation} from '@react-navigation/native';

// Import axios for making HTTP requests
import axios from 'axios';

// Import React and hooks for creating context and managing state
import React, {createContext, useEffect, useState} from 'react';

// Create a new context for authentication
export const AuthContext = createContext();

// Create the AuthProvider component that wraps the app
const AuthProvider = ({children}) => {
  // Get navigation object to use for redirecting users
  const navigation = useNavigation();

  // Store the current user's info and token in state
  const [auth, setAuth] = useState({
    user: null,  // No user by default
    token: null, // No token by default
  });

  // Set the Authorization header for all axios requests using the token
  axios.defaults.headers.common['Authorization'] = auth?.token;

  // Runs when component mounts
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // Get saved auth data from local storage
        const data = await AsyncStorage.getItem('user');
        if (data) {
          // If data exists, parse it
          const parseData = JSON.parse(data);

          // Set the auth state with user and token
          setAuth({
            user: parseData.user,
            token: parseData.token,
          });

          // Redirect to Home screen if user is logged in
          navigation.navigate('HomeScreen');
        } else {
          // If no data found, redirect to Login screen
          navigation.navigate('Login');
        }
      } catch (error) {
        // Log any errors
        console.error('Error Loading auth data: ', error);
      }
    };

    // Call the function to load saved user data
    loadAuthData();
  }, []);

  // Save user info and token to AsyncStorage and state when logging in
  const saveAuthData = async (user, token) => {
    try {
      // Create auth object
      const authData = {user, token};

      // Save it to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(authData));

      // Update the state
      setAuth(authData);

      // Set the token in axios for future requests
      axios.defaults.headers.common['Authorization'] = token;

      // (Optional) Log the stored data for debugging
      const storedData = await AsyncStorage.getItem('user');
      console.log(
        '****\\\\\\***** Stored Auth Data ****\\\\\\****:',
        storedData,
      );
    } catch (error) {
      // Log errors if saving fails
      console.error('Error saving auth data:', error);
    }
  };

  // Logout: Remove saved data and reset state
  const removeAuthData = async () => {
    try {
      // Delete the user data from AsyncStorage
      await AsyncStorage.removeItem('user');

      // Clear auth state
      setAuth({user: null, token: null});

      // Remove Authorization header from axios
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      // Log errors if removing fails
      console.error('Error removing auth data:', error);
    }
  };

  // Provide auth-related data and functions to child components
  return (
    <AuthContext.Provider value={{auth, setAuth, saveAuthData, removeAuthData}}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the provider so it can be used in the app
export default AuthProvider;
