import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Layout from './Layout';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import api from '../services/api';
import {AuthContext} from '../context/auth';

export default function UserDetails() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const {auth} = useContext(AuthContext);

  const fetchUser = async () => {
    try {
      if (!auth?.user?._id) {
        return;
      }
      const res = await api.get(`/api/v1/auth/user/${auth.user._id}`);
      setUser(res?.data?.user || null);
    } catch {
      setUser(auth?.user || null);
    }
  };
  useEffect(() => {
    fetchUser();
  }, [auth?.user?._id]);
  return (
    <Layout>
      <View
        style={{width: wp(77)}}
        className=" bg-[#D9D9D9] flex-1  align-middle items-center   px-6 rounded-lg ">
        <Text
          style={[{fontSize: wp(8)}, styles.text, styles.shadow]}
          className="  mt-20 text-[#775948]">
          USER PROFILE
        </Text>
        <View className="mt-8 w-[100%]">
          {!user ? (
            <ActivityIndicator color="#775948" style={{marginTop: 24}} />
          ) : (
            <>
              <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
                <Text
                  style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
                  className="text-[#775948]  ">
                  Name:
                </Text>
                <Text
                  style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
                  className="text-[#66636D]  ">
                  {user.name || '—'}
                </Text>
              </View>
              <View className="mb-9 truncate flex-row justify-between align-middle items-center gap-4">
                <Text
                  style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
                  className="text-[#775948]  ">
                  Email:
                </Text>
                <Text
                  style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
                  className="text-[#66636D]  ">
                  {user.email || '—'}
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
                  {user.phone || '—'}
                </Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity
          style={[styles.shadow]}
          onPress={() => navigation.navigate('EditUser')}
          className=" bg-gray-900 flex text-center top-10   px-2 py-1 rounded-md border-2 border-gray-900">
          <Text
            style={[{fontSize: wp(5)}]}
            className="font-bold text-[#D9D9D9] font-serif px-[10%] text-center ">
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
