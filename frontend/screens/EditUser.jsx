import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import api from '../../backend/api/api';
import {AuthContext} from '../../backend/context/auth';

export default function EditUser() {
  const navigation = useNavigation();
  const toast = useToast();
  const {auth, saveAuthData} = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const u = auth?.user;
    if (u) {
      setName(u.name || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
    }
  }, [auth?.user]);

  const handleSubmit = async () => {
    try {
      const res = await api.post('/api/v1/auth/update-profile', {
        name,
        email,
        phone,
      });
      if (res?.data?.success) {
        const nextUser = res.data.user;
        if (nextUser && auth?.token) {
          await saveAuthData(nextUser, auth.token);
        }
        toast.show('Updated successfully');
        navigation.navigate('UserDetails');
      } else {
        Alert.alert('Error', res?.data?.message || 'Update failed');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong';
      toast.show(msg);
    }
  };

  return (
    <Layout>
      <View className=" bg-[#D9D9D9] flex-1 justify-centr align-middle items-center h-[100%] w-[100%] px-6 rounded-lg ">
        <Text
          style={[{fontSize: wp(8)}, styles.text, styles.shadow]}
          className="  mt-20 text-[#775948]">
          EDIT PROFILE
        </Text>
        <View className="mt-8 w-[100%]">
          <View className="mb-5 flex-col justify-center align-middle  gap-2">
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#775948] ">
              Name:
            </Text>
            <TextInput
              placeholder="Enter User Name"
              value={name}
              onChangeText={setName}
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"
              accessibilityLabel="Full name"
            />
          </View>
          <View className="mb-5 flex-col justify-center align-middle  gap-2">
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#775948] ">
              Email:
            </Text>
            <TextInput
              placeholder="Enter Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"
              accessibilityLabel="Email address"
            />
          </View>
          <View className="mb-5 flex-col justify-center align-middle  gap-2">
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#775948] ">
              Whatsapp:
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter Whatsapp Number"
              keyboardType="phone-pad"
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"
              accessibilityLabel="WhatsApp phone number"
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.shadow]}
          onPress={handleSubmit}
          className=" bg-gray-900 flex text-center top-10   px-2 py-1 rounded-md border-2 border-gray-900">
          <Text
            style={[{fontSize: wp(4)}]}
            className="font-bold text-[#D9D9D9] font-serif px-[10%] ">
            Update Profile
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Arial Rounded MT Bold',
  },
  shadow: {
    shadowColor: '#00000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 8,
  },
});
