import {View, Text, SafeAreaView} from 'react-native';
import React from 'react';
import AppNavigation from './frontend/navigation/navigation';
const App = () => {
  Error.stackTraceLimit = 1000;

  return <AppNavigation />;
};

export default App;
