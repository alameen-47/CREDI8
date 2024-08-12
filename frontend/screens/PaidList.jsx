import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

export default function PaidList() {
  return (
    <Layout>
      <View style={{...styles.glassEffect, borderRadius: 15}}>
        <LinearGradient
          colors={['#151E25', '#775948', '#AB785B']} // Reversed the gradient direction colors
          start={{x: 0, y: 0}} // Start from bottom-right
          end={{x: 1, y: 1}} // End at top-left
          style={{flex: 1, borderRadius: 15}}
          className="opacity-70"
        />
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 overflow-hidden h-[100%] w-[100%]">
          <ScrollView nestedScrollEnabled={true}>
            <Text
              style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
              className=" text-center mt-[10%] text-[#F4F1D6]">
              PAID CUSTOMER LIST
            </Text>
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
    shadowColor: '#00000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 8,
  },
  glassEffect: {
    // Slightly decreased opacity for better clarity
    position: 'relative',
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(10px)', // Blur effect
  },
  contentContainer: {
    // flex: 1,
    padding: 20,
    zIndex: 10, // Ensure the content is above the background
  },
});
