import React from 'react';
import {
  Image,
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

const GetStartedScreen = () => {
  return (
    <View>
      <ImageBackground
        // source={{uri: 'data:image/png;base64,PUT_YOUR_BASE64_STRING_HERE'}}
        className="flex-1 justify-center items-center bg-gradient-to-t from-black to-gray-900">
        <View className="flex-1 justify-center items-center">
          <View className="mb-8">
            <Image
              source={require('/assets/LOGO CREDIT.png')}
              className="w-48 h-48"
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl text-white font-bold mb-4">CREDI8</Text>
          <TouchableOpacity className="bg-black px-6 py-2 rounded-full">
            <Text className="text-white text-lg font-semibold">
              GET STARTED
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default GetStartedScreen;
