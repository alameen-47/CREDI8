import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
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
            PENDING CUSTOMER LIST
          </Text>
          <View className="bg-[#D9D9D9] rounded-lg flex justify-center align-middle items-center flex-row">
            <Text
              style={[{fontSize: wp(5)}]}
              className=" w-[75%]  rounded-xl font-bold text-[#775948]  pl-2">
              Send Message To All
            </Text>
            <TouchableOpacity>
              <View className="bg-[#AB785B]  flex flex-row justify-center items-center align-middle p-1 m-2 rounded-lg ">
                <Text
                  style={[{fontSize: wp(3)}]}
                  className="text-[#F4F1D6] font-bold mr-2">
                  SEND
                </Text>
                <Image
                  style={{width: wp(3), height: wp(3)}}
                  className="z-20"
                  source={require('../assets/icons/send1.png')}
                />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView nestedScrollEnabled={true} className="">
            {/* //CUSTOMER DETAILS */}
            {customerData.map((c, index) => (
              <View key={index}>
                <View className="bg-black opacity-30 w-[100%] h-[65] rounded-xl mb-2 "></View>
                <Image
                  style={{width: wp(9), height: wp(9)}}
                  className="z-50 absolute flex right-[-7] top-[-14] "
                  source={require('../assets/icons/Pending.png')}
                />
                <View className="absolute p-[2%] flex justify-between flex-row gap-1 ">
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
                  <TouchableOpacity className="bg-[#D9D9D9] flex justify-center align-middle items-center  top-5 rounded-3xl h-[40%] pt-1 w-auto">
                    <Image
                      style={{width: wp(7), height: wp(7)}}
                      className="z-20"
                      source={require('../assets/icons/Sent.png')}
                    />
                  </TouchableOpacity>
                  <View className="bg-[#D9D9D9] justify-center align-middle items-center text-center rounded-xl flex ">
                    <Text
                      style={[{fontSize: wp(5)}]}
                      className="text-[#775948] text-center font-extrabold w-auto h-auto t  ">
                      {c.amount}/-
                    </Text>
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
