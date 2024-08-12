import axios from 'axios';

// Use 10.0.2.2 for Android emulator, localhost or your IP for iOS simulator or physical device
const api = axios.create({
  baseURL: 'http://10.0.2.2:8086', // Change this to your backend URL
});

export default api;
