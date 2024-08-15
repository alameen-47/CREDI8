import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

export default function EditMessage() {
  return (
    <Layout>
      <View style={{...styles.glassEffect, borderRadius: 15}}>
        <LinearGradient
          colors={['#151E25', '#775948', '#AB785B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{flex: 1, borderRadius: 15}}
          className="opacity-70 "
        />
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 w-[100%] h-[100%] space-y-4">
          <Text
            style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
            className=" text-center mt-[10%] text-[#F4F1D6]">
            EDIT MESSAGE
          </Text>
          <ScrollView nestedScrollEnabled={true} className="">
            <View
              style={[{width: 275, height: 580}, styles.shadow]}
              className="bg-[#D9D9D9] rounded-lg py-3 align-middle items-center space-y-2">
              <View>
                <Text
                  style={[
                    {fontSize: wp(5)},
                    {width: wp(60)},
                    {height: hp(3.8)},
                  ]}
                  className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                  Previous Message:
                </Text>
                <View
                  style={[{width: wp(60), height: wp(50)}]}
                  className="bg-white rounded-lg">
                  <Text style={{fontSize: wp(4)}} className="p-3">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Sunt ex eligendi deleniti cumque, reiciendis assumenda?
                    Nobis iusto alias repellendus eaque eius praesentium omnis
                    commodi unde officia pariatur consequatur eligendi, maxime
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    {fontSize: wp(5)},
                    {width: wp(60)},
                    {height: hp(3.8)},
                  ]}
                  className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                  New Message:
                </Text>
                <View
                  style={[{width: wp(60), height: wp(50)}]}
                  className="bg-white rounded-lg">
                  <TextInput
                    style={{fontSize: wp(4)}}
                    className="p-3"></TextInput>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.shadow]}
                onPress={() => navigation.navigate('EditUser')}
                className=" bg-gray-900 flex text-center  top-[2%]  px-2 py-1 rounded-md border-2 border-gray-900">
                <Text
                  style={[{fontSize: wp(4)}]}
                  className="font-bold text-[#D9D9D9] font-serif px-[10%] ">
                  UPDATE MESSAGE
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Layout>
  );
}
const styles = StyleSheet.create({
  Text: {
    fontFamily: 'Arial Rounded MT Bold',
  },
  shadow: {
    shadowColor: '#000000', // Corrected color code
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8, // Valid opacity value
    shadowRadius: 9,
    elevation: 8, // This will work on Android
  },
  glassEffect: {
    // Slightly decreased opacity for better clarity
    position: 'relative',
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(10px)', // Blur effect
  },
  contentContainer: {
    flex: 1,

    padding: 20,
    zIndex: 10, // Ensure the content is above the background
  },
});
