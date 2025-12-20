import {View, StyleSheet, SafeAreaView, ImageBackground} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

export default function Layout({children}) {
  return (
    <SafeAreaView className=" flex-1 w-screen">
      <Header />
      <View className="flex-1 flex flex-row ">
        <ImageBackground
          className="  absolute z-1 bottom-0 m-auto flex justify-center items-center align-middle w-screen h-screen "
          source={require('../assets/Background.png')}></ImageBackground>
        <SideBar style={{position: 'absolute', zIndex: 100}} />
        <View
          style={{width: wp(77), height: wp(170), zIndex: 50}}
          className=" absolute  justify-center items-center align-middle text-center ml-[75] mt-4 rounded-lg">
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}
