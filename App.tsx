// // App.tsx

// import React from 'react';
// import {View, Text} from 'react-native';

// const App = () => {
//   return (
//     <View>
//       <Text className="text-2xl flex bg-black text-white justify-center items-center align-middle text-center">
//         Hello, world!
//       </Text>

//       {/* Add more screens or components as needed */}
//     </View>
//   );
// };

// export default App;
// App.js
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import axios from 'axios';
import LoginScreen from './frontend/screens/LoginScreen.jsx';
import GetStartedScreen from './frontend/screens/GetStartedScreen.jsx';

const App = () => {
  const [dbStatus, setDbStatus] = useState('Checking database connection...');

  useEffect(() => {
    axios
      .get('http://localhost:8081')
      .then(response => {
        setDbStatus('Database is connected');
      })
      .catch(error => {
        setDbStatus('Failed to connect to database');
      });
  }, []);

  return (
    <View>
      {/* <LoginScreen /> */}
      <GetStartedScreen />
    </View>
  );
};

export default App;
