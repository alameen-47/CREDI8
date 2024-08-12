import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';

export default function UserDetails() {
  const navigation = useNavigation();

  return (
    <Layout>
      <View className=" bg-[#D9D9D9] flex-1 justify-centr align-middle items-center h-[100%] w-[100%] px-6 rounded-lg ">
        <Text
          style={[{fontSize: wp(8)}, styles.text, styles.shadow]}
          className="  mt-20 text-[#775948]">
          USER PROFILE
        </Text>
        <View className="mt-8 w-[100%]">
          <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
            <Text
              style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
              className="text-[#775948]  ">
              Name:
            </Text>
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#66636D]  ">
              UserName
            </Text>
          </View>
          <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
            <Text
              style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
              className="text-[#775948]  ">
              Email:
            </Text>
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#66636D]  ">
              www.email@gmai.com
            </Text>
          </View>
          <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
            <Text
              style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
              className="text-[#775948]  ">
              Whatsapp:
            </Text>
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#66636D]  ">
              +982949 827492
            </Text>
          </View>
          <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
            <Text
              style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
              className="text-[#775948]  ">
              Mobile:
            </Text>
            <Text
              style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
              className="text-[#66636D]  ">
              +422 481 222 32
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.shadow]}
          onPress={() => navigation.navigate('EditUser')}
          className=" bg-gray-900 flex text-center top-10   px-2 py-1 rounded-md border-2 border-gray-900">
          <Text
            style={[{fontSize: wp(5)}]}
            className="font-bold text-[#D9D9D9] font-serif px-[10%] ">
            Edit Profile
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
