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
import api from '../../backend/api/api';

export default function LoginScreen() {
  const toast = useToast();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await api.post('/api/v1/auth/login', {
        email,
        password,
      });
      if (res && res.data.success) {
        toast.show('Login Successfull!!!');
        navigation.navigate('HomeScreen');
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
        <View className="top-36">
          <Text
            style={[{fontSize: wp(18)}, styles.text]}
            className="text-[#F4F1D6] ">
            Sign In
          </Text>
        </View>
        <View className="flex justify- space-y-4 align- items-center  top-[60%] w-screen ">
          <View className="flex justify-between ">
            <Text className="text-[#F4F1D6] text-lg pl-2">Email:</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[{width: wp(95)}]}
              className="pl-5 bg-[#F4F1D6] justify-center h-14 align-middle items-center w-screen  rounded-xl"
              placeholder="Enter Your Email"
            />
          </View>
          <View className="flex justify-between ">
            <Text className="text-[#F4F1D6] text-lg pl-2">Password:</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={[{width: wp(95)}]}
              className="pl-5 bg-[#F4F1D6] justify-center h-14 align-middle items-center w-screen  rounded-xl"
              placeholder="Enter Your Password"
            />
          </View>
          <View className="text-[#F4F1D6] flex flex-row">
            <Text className="text-[#F4F1D6] ">Dont Have An Account? </Text>
            <Text
              style={styles.Poppins}
              onPress={() => navigation.navigate('SignUp')}
              className="text-[#e99b35] ">
              Sign Up
            </Text>
          </View>
          <View className="text-[#F4F1D6] flex flex-row">
            <Text className="text-[#F4F1D6] ">Forgot Password? </Text>
            <Text
              style={styles.Poppins}
              onPress={() => navigation.navigate('ResetPassword')}
              className="text-[#e99b35] ">
              Reset Password
            </Text>
          </View>
        </View>
        <View className=" top-[75%]">
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.shadow]}
            className=" bg-gray-900 flex text-center   px-2 py-1 rounded-md border-2 border-gray-900">
            <Text
              style={[{fontSize: wp(9)}]}
              className="font-bold text-[#D9D9D9] font-serif px-[30%] ">
              Sign In
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
  Poppins: {
    fontFamily: 'Poppins Medium', // Make sure this matches the font's name
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
