import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';

export default function EditUser() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await api.post('/api/v1/auth/update-profile', {
        name,
        email,
        // password,
        phone,
      });
      if (res && res.data.success) {
        toast.show('Updated Successfully!!!');
        navigation.navigate('UserDetails');
      } else {
        alert('Error', res.data.message);
      }
    } catch (error) {
      toast.show(`Something went wrong!! ${error.message}`);
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
              onChangeText={setName}
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"></TextInput>
          </View>
          <View className="mb-5 flex-col justify-center align-middle  gap-2">
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#775948] ">
              Email:
            </Text>
            <TextInput
              placeholder="Enter Email Address"
              onChangeText={setEmail}
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"></TextInput>
          </View>
          <View className="mb-5 flex-col justify-center align-middle  gap-2">
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#775948] ">
              Whatsapp:
            </Text>
            <TextInput
              onChangeText={setPhone}
              placeholder="Enter Whatsapp Number"
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"></TextInput>
          </View>
          {/* <View className="mb-5 flex-col justify-center align-middle  gap-2">
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#775948] ">
              Mobile (Optional):
            </Text>
            <TextInput
              placeholder="Enter Mobile Number"
              className=" text-black bg-white w-[100%] px-2 rounded-lg  p-1"></TextInput>
          </View> */}
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
    // Make sure this matches the font's name
  },
  shadow: {
    shadowColor: '#00000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 8,
  },
});
