import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import React, {useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function AddCustomerScreen() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Layout>
      <View style={{...styles.glassEffect, flex: 1, borderRadius: 15}}>
        <LinearGradient
          colors={['#151E25', '#775948', '#AB785B']} // Reversed the gradient direction colors
          start={{x: 0, y: 0}} // Start from bottom-right
          end={{x: 1, y: 1}} // End at top-left
          style={{flex: 1, borderRadius: 15}}
          className="opacity-70"
        />
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 h-[100%] w-[100%]">
          <Text
            style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
            className="text-center mt-[10%] text-[#F4F1D6]">
            ADD CUSTOMER DETAILS
          </Text>
          <View className="mt-8 w-[100%]">
            <View className="mb-5 flex-col justify-center align-middle gap-2 ">
              <Text
                style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                className="text-[#F4F1D6]">
                Name:
              </Text>
              <TextInput
                placeholder="Enter Customer Name"
                className="text-black bg-white w-[100%] px-2 rounded-lg p-1"></TextInput>
            </View>
            <View className="mb-5 flex-col justify-center align-middle gap-2">
              <Text
                style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                className="text-[#F4F1D6]">
                Number:
              </Text>
              <TextInput
                placeholder="Enter Customer Mobile Number"
                className="text-black bg-white w-[100%] px-2 rounded-lg p-1"></TextInput>
            </View>
            <View className="mb-5 flex-col justify-center align-middle gap-2">
              <Text
                style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                className="text-[#F4F1D6]">
                Amount:
              </Text>
              <TextInput
                placeholder="Enter Amount"
                className="text-black bg-white w-[100%] px-2 rounded-lg p-1"></TextInput>
            </View>
            <View className="mb-5 flex-col justify-center align-middle gap-2">
              <Text
                style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                className="text-[#F4F1D6]">
                Due Date:
              </Text>
              <TouchableOpacity
                onPress={showDatepicker}
                title="Show date picker!"
                placeholder="Enter Mobile Number"
                className="text-black bg-white w-[100%] px-2 rounded-lg flex">
                <Text>
                  Click To Select Due Date:{'\n'}
                  <Text className="font-bold">
                    Selected Due Date: {formatDate(date)}
                  </Text>
                </Text>
              </TouchableOpacity>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChange}
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.shadow]}
            onPress={() => navigation.navigate('EditUser')}
            className="bg-gray-900 flex text-center top-10 px-2 py-1 rounded-md border-2 border-gray-900">
            <Text
              style={[{fontSize: wp(4)}]}
              className="font-bold text-[#D9D9D9] font-serif text-center flex px-2">
              ADD CUSTOMER
            </Text>
          </TouchableOpacity>
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
