import {View, Text, Image, TouchableOpacity} from 'react-native';
import React, {useContext, useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../../backend/context/auth';

export default function SideBar() {
  const [toggle, setToggle] = useState(false);
  const navigation = useNavigation();
  const {removeAuthData} = useContext(AuthContext);

  return (
    <View style={{flex: 1}}>
      {!toggle ? (
        <View
          style={{
            zIndex: 999,
            position: 'absolute',
            height: '100%',
            width: '18%',
          }}
          className="absolute h-auto flex justify-between bg-[#151E25] py-16">
          <View className="flex justify-center align-middle items-center">
            <TouchableOpacity
              onPress={() => setToggle(true)}
              className="focus:text-[#D9D9D9]">
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/addUser.png')}
              />
            </TouchableOpacity>
          </View>
          <View className="flex justify-center align-middle items-center">
            <TouchableOpacity onPress={() => setToggle(true)}>
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/editUser.png')}
              />
            </TouchableOpacity>
          </View>

          <View className="flex justify-center align-middle items-center">
            <TouchableOpacity onPress={() => setToggle(true)}>
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/allCustomers.png')}
              />
            </TouchableOpacity>
          </View>
          <View className="flex justify-center align-middle items-center">
            <TouchableOpacity onPress={() => setToggle(true)}>
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/editMessage.png')}
              />
            </TouchableOpacity>
          </View>
          <View className="flex justify-center align-middle items-center transform rotate-180">
            <TouchableOpacity onPress={() => setToggle(true)}>
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/Logout.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            zIndex: 999,
            position: 'absolute',
            height: '100%',
            width: '55%',
          }}
          className="absolute flex justify-start align-center items-start bg-[#151E25] py-[18%] px-3 space-y-[55%] ">
          <View className="flex justify-start items-center ">
            <TouchableOpacity
              onPress={() => {
                setToggle(false);
                navigation.navigate('AddCustomer');
              }}
              className="flex flex-row justify-between items-center align-middle gap-3 px-2">
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/addUser.png')}
              />
              <Text
                style={{fontSize: wp(4.5)}}
                className="text-[#F4F1D6] font-bold">
                ADD CUSTOMER
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-start items-center">
            <TouchableOpacity
              onPress={() => {
                setToggle(false);
                navigation.navigate('EditCustomer');
              }}
              className="flex flex-row justify-between items-center align-middle gap-3 px-2">
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/editUser.png')}
              />
              <Text
                style={{fontSize: wp(4.5)}}
                className="text-[#F4F1D6] font-bold">
                EDIT CUSTOMER
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex justify-start items-center">
            <TouchableOpacity
              onPress={() => {
                setToggle(false);
                navigation.navigate('AllCustomers');
              }}
              className="flex flex-row justify-between items-center align-middle gap-3 px-2">
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/allCustomers.png')}
              />
              <Text
                style={{fontSize: wp(4.5)}}
                className="text-[#F4F1D6] font-bold">
                ALL CUSTOMERS
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-start items-center">
            <TouchableOpacity
              onPress={() => {
                setToggle(false);
                navigation.navigate('EditMessage');
              }}
              className="flex flex-row justify-between items-center align-middle gap-3 px-2">
              <Image
                style={{width: wp(9), height: wp(9)}}
                source={require('../assets/icons/editMessage.png')}
              />
              <Text
                style={{fontSize: wp(4.5)}}
                className="text-[#F4F1D6] font-bold">
                EDIT MESSAGE
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-start items-center">
            <TouchableOpacity
              onPress={async () => {
                await removeAuthData();
                setToggle(false);
                navigation.navigate('LogIn');
              }}
              className="flex flex-row justify-between items-center align-middle gap-3 px-2">
              <Image
                style={{width: wp(9), height: wp(9)}}
                className="transform rotate-180"
                source={require('../assets/icons/Logout.png')}
              />
              <Text
                style={{fontSize: wp(4.5)}}
                className="text-[#F4F1D6] font-bold">
                LOGOUT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
