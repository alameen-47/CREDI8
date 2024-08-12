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
        <SideBar />
        <ImageBackground
          className="  absolute z-1 bottom-0 m-auto flex justify-center items-center align-middle w-screen h-screen "
          source={require('../assets/Background.png')}></ImageBackground>
        <View
          style={{width: wp(77), height: wp(160)}}
          className=" z-2 absolute justify-center items-center align-middle text-center ml-[75] mt-4 rounded-lg">
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '20%', // Adjust the width as per your requirement
    backgroundColor: '#f0f0f0',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
