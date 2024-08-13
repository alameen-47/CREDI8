import {View, Text, StyleSheet, ScrollView, Image} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

const customerData = [
  // Add your customer data here
  {
    name: 'Salman Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Sharukh Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Salman Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Sharukh Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Salman Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Sharukh Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Salman Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
  {
    name: 'Sharukh Khan',
    purchaseDate: '10/03/2024',
    dueDate: '10/04/2025',
    amount: '185',
    paidDate: '10/03/2024',
  },
];

export default function PaidList() {
  return (
    <Layout>
      <View style={{...styles.glassEffect, borderRadius: 15}}>
        <LinearGradient
          colors={['#151E25', '#775948', '#AB785B']} // Reversed the gradient direction colors
          start={{x: 0, y: 0}} // Start from bottom-right
          end={{x: 1, y: 1}} // End at top-left
          style={{flex: 1, borderRadius: 15}}
          className="opacity-70 "
        />
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 w-[100%] h-[100%]">
          <Text
            style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
            className=" text-center mt-[10%] text-[#F4F1D6]">
            PAID CUSTOMER LIST
          </Text>
          <ScrollView nestedScrollEnabled={true}>
            {/* //CUSTOMER DETAILS */}
            {customerData.map((c, index) => (
              <View key={index} className="">
                <View className="bg-black opacity-30 w-[100%] h-[65] rounded-xl mb-2"></View>
                <Image
                  style={{width: wp(9), height: wp(9)}}
                  className="z-50 absolute flex right-[-7] top-[-14] "
                  source={require('../assets/icons/CheckMark.png')}
                />
                <View className="absolute p-[2%] flex justify-between flex-row gap-1">
                  <View className="flex">
                    <Text
                      style={[{fontSize: wp(5)}]}
                      className="bg-[#D9D9D9] w-[100%]  rounded-xl font-bold text-[#775948] mb-1 pl-2">
                      {c.name}
                    </Text>
                    <View className="flex justify-between align-middle items-center flex-row w-[170]">
                      <View className="bg-[#D9D9D9] w-auto px-2 rounded-xl ">
                        <Text
                          style={[{fontSize: wp(2.5)}]}
                          className="font-bold text-[#775948] text-center">
                          Purchase Date:
                        </Text>
                        <Text
                          style={[{fontSize: wp(2)}]}
                          className="font-bold text-[#775948 text-center">
                          {c.purchaseDate}
                        </Text>
                      </View>
                      <View className="bg-[#D9D9D9] w-auto px-5 rounded-xl ">
                        <Text
                          style={[{fontSize: wp(2.5)}]}
                          className="font-bold text-[#775948] text-center">
                          Due Date:
                        </Text>
                        <Text
                          style={[{fontSize: wp(2)}]}
                          className="font-bold text-[#775948 text-center">
                          {c.dueDate}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-[30%] rounded-xl flex justify-around bottom-1 gap-1">
                    <View className="bg-[#D9D9D9]  rounded-xl flex ">
                      <Text
                        style={[{fontSize: wp(5)}]}
                        className="text-[#775948] text-center font-extrabold w-[100%] h-auto py-[1%] mx-[1%] ">
                        {c.amount}
                      </Text>
                    </View>
                    <View className="bg-[#D9D9D9]  px-[2] rounded-xl ">
                      <Text
                        style={[{fontSize: wp(2)}]}
                        className="font-bold text-[#775948] text-center">
                        Paid Date:
                      </Text>
                      <Text
                        style={[{fontSize: wp(2)}]}
                        className="font-bold text-[#775948 text-center">
                        {c.paidDate}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
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
    position: 'relative',
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(10px)',
  },
  contentContainer: {
    flex: 1,

    padding: 20,
    zIndex: 10,
  },
});
