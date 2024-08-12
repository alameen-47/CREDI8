import {View, Text, TextInput, Image, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';

export default function Header() {
  const navigation = useNavigation();
  const [drop, setDrop] = useState(1);
  return (
    <View className="space-x-12  z-30 bg-[#151E25] flex justify-center items-center align-middle p-2 flex-row">
      <View>
        <Image
          style={{width: wp(15), height: wp(14)}}
          source={require('../assets/icons/Logo-small.png')}
        />
      </View>
      <View className="search-Bar bg-white w-[50%] rounded-3xl ">
        <TextInput
          className=" text-black  align-middle items-center h-9 pl-4 justify-center "
          style={[{fontSize: wp(3.5)}]}
          placeholder="Search..."
          placeholder-gray-100></TextInput>
      </View>
      <View>
        {drop === 1 ? (
          <TouchableOpacity onPress={() => setDrop(2)}>
            <Image
              style={{width: wp(9), height: wp(9)}}
              source={require('../assets/icons/Hamburger-Menu.png')}
            />
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity onPress={() => setDrop(1)}>
              <Image
                style={{width: wp(6), height: wp(6)}}
                source={require('../assets/icons/X-icon.png')}
              />
            </TouchableOpacity>
            {/* //List items */}
            <View className="absolute top-[40px] w-[150px] p-3 justify-between space-y-5  bg-[#151E25] right-[-14] rounded-bl-xl ">
              <TouchableOpacity
                onPress={() => navigation.navigate('UserDetails')}
                className="flex flex-row gap-x-3">
                <Image
                  style={{width: wp(7), height: wp(7)}}
                  source={require('../assets/icons/User.png')}
                />
                <Text className="text-[#F4F1D6]  font-serif font-bold text-center text-lg">
                  User Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditUser')}
                className="flex flex-row gap-x-3">
                <Image
                  style={{width: wp(7), height: wp(7)}}
                  source={require('../assets/icons/adminEdit.png')}
                />
                <Text className="text-[#F4F1D6]  font-serif font-bold text-center text-lg">
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('LogIn')}
                className="flex flex-row gap-x-3">
                <Image
                  style={{width: wp(7), height: wp(7)}}
                  source={require('../assets/icons/Logout.png')}
                />
                <Text className="text-[#F4F1D6]  font-serif font-bold text-center text-lg">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
