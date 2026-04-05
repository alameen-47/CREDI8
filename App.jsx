import React from 'react';
import AppNavigation from './frontend/navigation/navigation';

const App = () => {
  if (__DEV__) {
    Error.stackTraceLimit = 1000;
  }
  return <AppNavigation />;
};

export default App;
