import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import api from '../../backend/api/api';
import {useToast} from 'react-native-toast-notifications';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      const res = await api.post('/api/v1/auth/register', {
        name,
        email,
        password,
        phone,
      });
      if (res && res.data.success) {
        toast.show('Registered Successfully!!!');
        navigation.navigate('LogIn');
      } else {
        alert('Error', res.data.message);
      }
    } catch (error) {
      toast.show(`Something went wrong!! ${error.message}`);
    }
  };

  return (
    <LinearGradient
      colors={['#AB785B', '#775948', '#151E25']}
      style={[{flex: 1}]}>
      <SafeAreaView className="items-center ">
        <View className="top-24">
          <Text
            style={[{fontSize: wp(18)}, styles.text]}
            className="text-[#F4F1D6] ">
            Sign Up
          </Text>
        </View>
        <View className="flex justify- space-y-4 align- items-center  top-[25%] w-screen ">
          <View className="flex justify-between ">
            <Text className="text-[#F4F1D6] text-lg pl-2">Name:</Text>
            <TextInput
              type="name"
              value={name}
              onChangeText={setName}
              style={[{width: wp(95)}]}
              className="pl-5 bg-[#F4F1D6] justify-center h-12 align-middle items-center w-screen  rounded-xl"
              placeholder="Enter Your Name"
              autoFocus
              required
            />
          </View>
          <View className="flex justify-between ">
            <Text className="text-[#F4F1D6] text-lg pl-2">Email:</Text>
            <TextInput
              type="email"
              value={email}
              onChangeText={setEmail}
              style={[{width: wp(95)}]}
              className="pl-5 bg-[#F4F1D6] justify-center h-12 align-middle items-center w-screen  rounded-xl"
              placeholder="Enter Your Email"
            />
          </View>
          <View className="flex justify-between ">
            <Text className="text-[#F4F1D6] text-lg pl-2">Password:</Text>
            <TextInput
              type="password"
              value={password}
              onChangeText={setPassword}
              style={[{width: wp(95)}]}
              className="pl-5 bg-[#F4F1D6] justify-center h-12 align-middle items-center w-screen  rounded-xl"
              placeholder="Enter Your Password"
            />
          </View>
          <View className="flex justify-between ">
            <Text className="text-[#F4F1D6] text-lg pl-2">Whatsapp No:</Text>
            <TextInput
              type="text"
              value={phone}
              onChangeText={setPhone}
              style={[{width: wp(95)}]}
              className="pl-5 bg-[#F4F1D6] justify-center h-12 align-middle items-center w-screen  rounded-xl"
              placeholder="Enter Your Whatsapp Number"
            />
          </View>
          <View className="text-[#F4F1D6] flex flex-row ">
            <Text className="text-[#F4F1D6] ">Already Have An Account? </Text>
            <Text
              onPress={() => navigation.navigate('LogIn')}
              className="text-[#e99b35] ">
              Sign In
            </Text>
          </View>
        </View>
        <View className=" top-[30%]">
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.shadow]}
            className=" bg-gray-900 flex text-center   px-2 py-1 rounded-md border-2 border-gray-900">
            <Text
              style={[{fontSize: wp(9)}]}
              className="font-bold text-[#D9D9D9] font-serif px-[28%] ">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Arial Rounded MT Bold', // Make sure this matches the font's name
    // fontSize: 20,
    // fontSize: '10px',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
