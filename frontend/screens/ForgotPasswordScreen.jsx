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
import {useToast} from 'react-native-toast-notifications';
import axios from 'axios';
import api from '../../backend/api/api';
import {set} from 'mongoose';

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const navigation = useNavigation();

  //NEW PASSWORD
  const handleResetPassword = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/api/v1/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      if (res && res.data.success) {
        toast.show('Password reset successfully');
        navigation.navigate('LogIn');
      } else {
        toast.show('Invalid OTP');
      }
    } catch (error) {
      console.log(error);
      toast.show('Something went wrong!!!');
    }
  };

  //SEND OTP
  const handleSendOtp = async e => {
    e.preventDefault();

    try {
      const res = await api.post('/api/v1/auth/send-otp', {
        email,
      });
      if (res && res.data.success) {
        toast.show('OTP has been sent to the Email');
        setStep(2);
      } else {
        toast.show('Something went wrong!!!');
      }
    } catch (error) {
      console.log(error);
      toast.show('Error while sending OTP. Please check your email.');
    }
  };

  return (
    <LinearGradient
      colors={['#AB785B', '#775948', '#151E25']}
      style={[{flex: 1}]}>
      <SafeAreaView className=" flex-1 items-center ">
        {step === 1 && (
          <>
            <View className="top-28 ">
              <Text
                style={[{fontSize: wp(18)}, styles.text]}
                className="text-[#F4F1D6] justify-center text-center">
                Reset Password
              </Text>
            </View>
            <View className="flex justify- space-y-4 align- items-center top-[35%] w-screen">
              <View className="flex justify-between">
                <Text className="text-[#F4F1D6] text-lg pl-2">Email:</Text>
                <TextInput
                  value={email}
                  onChangeText={text => setEmail(text)}
                  style={[{width: wp(95)}]}
                  className="pl-5 bg-[#F4F1D6] justify-center h-14 align-middle items-center w-screen rounded-xl"
                  placeholder="Enter Your Email"
                />
              </View>

              <View className="text-[#F4F1D6] flex flex-row">
                <Text className="text-[#F4F1D6]">Don't Have An Account? </Text>
                <Text
                  onPress={() => navigation.navigate('SignUp')}
                  style={styles.Poppins}
                  className="text-[#e99b35]">
                  Sign Up
                </Text>
              </View>
            </View>
            <View className="top-[45%] space-y-2">
              <TouchableOpacity
                onPress={handleSendOtp}
                style={[styles.shadow]}
                className="bg-gray-900 flex text-center px-2 py-1 rounded-md border-2 border-gray-900">
                <Text
                  style={[{fontSize: wp(9)}]}
                  className="font-bold text-center text-[#D9D9D9] font-serif px-10">
                  Generate OTP
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <View className=" top-28">
              <Text
                style={[{fontSize: wp(18)}, styles.text]}
                className="text-[#F4F1D6] justify-center text-center">
                New Password
              </Text>
            </View>
            <View className="flex justify-center align-middle  space-y-4 top-[25%] items-center  w-screen">
              <View className="flex justify-between">
                <Text className="text-[#F4F1D6] text-lg pl-2">OTP:</Text>
                <TextInput
                  value={otp}
                  onChangeText={text => setOtp(text)}
                  style={[{width: wp(95)}]}
                  className="pl-5 bg-[#F4F1D6] justify-center h-14 align-middle items-center w-screen rounded-xl"
                  placeholder="Enter Your OTP"
                  secureTextEntry
                />
              </View>
              <View className="flex justify-between">
                <Text className="text-[#F4F1D6] text-lg pl-2">
                  New Password:
                </Text>
                <TextInput
                  value={newPassword}
                  onChangeText={text => setNewPassword(text)}
                  style={[{width: wp(95)}]}
                  className="pl-5 bg-[#F4F1D6] justify-center h-14 align-middle items-center w-screen rounded-xl"
                  placeholder="Enter Your New Password"
                  secureTextEntry
                />
              </View>
              <View className="text-[#F4F1D6] flex flex-row">
                <Text className="text-[#F4F1D6]">Don't Have An Account? </Text>
                <Text
                  style={styles.Poppins}
                  onPress={() => navigation.navigate('SignUp')}
                  className="text-[#e99b35]">
                  Sign Up
                </Text>
              </View>
            </View>
            <View className=" top-[30%] space-y-2">
              <TouchableOpacity
                onPress={handleResetPassword}
                style={[styles.shadow]}
                className="bg-gray-900 flex text-center px-2 py-1 rounded-md border-2 border-gray-900">
                <Text
                  style={[{fontSize: wp(9)}]}
                  className="font-bold text-[#D9D9D9] font-serif px-10">
                  Reset Password
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  },
  Poppins: {
    fontFamily: 'Poppins Medium', // Make sure this matches the font's name
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
