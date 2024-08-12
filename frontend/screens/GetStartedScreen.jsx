import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// import {styled} from 'nativewind';

// const StyledView = styled(View);
// const StyledText = styled(Text);
// const StyledImage = styled(Image);
// const StyledTouchableOpacity = styled(TouchableOpacity);

const GetStartedScreen = () => {
  const navigation = useNavigation();
  const styles = StyleSheet.create({
    shadow: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    font: {
      fontFamily: 'Poppins-Regular',
    },
  });
  return (
    <LinearGradient
      colors={['#AB785B', '#775948', '#151E25']}
      style={{flex: 1}}>
      <SafeAreaView className="flex-1 justify-around ">
        <View className="flex-col justify-center ">
          <Image
            style={{width: wp(100), height: wp(90)}}
            source={require('../assets/LOGO.png')}
          />
          <View className="flex justify-between bottom-14  items-center align-middle ">
            <Image
              className="w-auto h-auto "
              source={require('../assets/CREDI8text.png')}
            />
            <Text
              style={{fontSize: wp(4)}}
              className=" font-semibold text-center text-[#F4F1D6]">
              Track, Manage, Succeed!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.shadow]}
          onPress={() => navigation.navigate('HomeScreen')}
          // onPress={() => navigation.navigate('SignUp')}
          className="bottom-11 bg-gray-900 flex justify-center align-middle items-center text-center  mx-9 px-2 py-1 rounded-md border-2  border-gray-900">
          <Text
            style={[{fontSize: wp(9)}]}
            className="font-bold text-[#D9D9D9] font-serif ">
            GET STARTED
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default GetStartedScreen;
