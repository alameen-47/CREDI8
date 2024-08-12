// In App.js in a new project

import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GetStartedScreen from '../screens/GetStartedScreen.jsx';
import LoginScreen from '../screens/LoginScreen.jsx';
import SignUpScreen from '../screens/SignUpScreen.jsx';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.jsx';
import AddCustomerScreen from '../screens/AddCustomerScreen.jsx';
import CustomerListScreen from '../screens/CustomerListScreen.jsx';
const Stack = createNativeStackNavigator();
import {ToastProvider} from 'react-native-toast-notifications';
import HomeScreen from '../screens/HomeScreen.jsx';
import EditCustomer from '../screens/EditCustomer.jsx';
import PaidList from '../screens/PaidList.jsx';
import PendingList from '../screens/PendingList.jsx';
import AllCustomers from '../screens/AllCustomers.jsx';
import EditMessage from '../screens/EditMessage.jsx';
import UserDetails from '../screens/UserDetails.jsx';
import EditUser from '../screens/EditUser.jsx';

function AppNavigation() {
  return (
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{headerShown: false}}
          initialRouteName="GetStarted">
          <Stack.Screen name="GetStarted" component={GetStartedScreen} />
          <Stack.Screen name="LogIn" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ResetPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
          <Stack.Screen name="CustomerList" component={CustomerListScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="EditCustomer" component={EditCustomer} />
          <Stack.Screen name="PaidList" component={PaidList} />
          <Stack.Screen name="PendingList" component={PendingList} />
          <Stack.Screen name="AllCustomers" component={AllCustomers} />
          <Stack.Screen name="EditMessage" component={EditMessage} />
          <Stack.Screen name="UserDetails" component={UserDetails} />
          <Stack.Screen name="EditUser" component={EditUser} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}

export default AppNavigation;
