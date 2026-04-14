import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import api from '../services/api';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';

export default function EditCustomer({route}) {
  const navigation = useNavigation();
  const {customer} = route?.params || {};
  const [custName, setCustName] = useState(customer?.custName);
  const [custNumber, setCustNumber] = useState(customer?.custNumber);
  const [custAmount, setCustAmount] = useState(customer?.custAmount);
  const [custDueDate, setCustDueDate] = useState(customer?.custDueDate);
  const [show, setShow] = useState(false);
  const [previousDueDate, setPreviousDueDate] = useState();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleAddAmount = (text, sign) => {
    const num = Number(text);
    if (sign === 'add') {
      setCustAmount(prev => prev + num);
    } else if (sign === 'sub') {
      setCustAmount(prev => prev - num);
    }
    // console.log('<<<<<<<<<<<<<<<<', custAmount, '>>>>>>>>>>>>>');
  };

  const handleSubmit = async () => {
    try {
      const updatedFields = {_id: customer._id};
      if (custName !== customer.custName) updatedFields.custName = custName;
      if (custNumber !== customer.custNumber)
        updatedFields.custNumber = custNumber;
      if (custAmount !== customer.custAmount)
        updatedFields.custAmount = custAmount;
      if (custDueDate !== customer.custDueDate)
        updatedFields.custDueDate = custDueDate;

      if (Object.keys(updatedFields).length === 1) {
        toast.show('No Changes Made !!!');
        return;
      }
      // console.log('**************Editing DATA************', updatedFields);
      const res = await api.put(
        '/api/v1/customer/edit-customer',
        updatedFields,
      );
      if (res && res.data.success) {
        toast.show('Customer Details Updated Succesfully');
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.show(msg);
    }
  };

  const previousDueDAte = () => {
    setPreviousDueDate(
      customer && custDueDate.split('T')[0].split('-').reverse().join('-'),
    );
  };

  useEffect(() => {
    previousDueDAte();
  }, []);
  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setCustDueDate(selectedDate);
    }
    setShow(false);
  };
  const showDatepicker = () => {
    setShow(true);
  };
  const formatDate = custDueDate => {
    if (!custDueDate) return 'Select a Date';
    const date = new Date(custDueDate);

    if (isNaN(date.getTime())) return 'Invalid Date!!';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
              EDIT CUSTOMER DETAILS
            </Text>
            <View className="mt-8 w-[100%]">
              <View className="mb-5 flex-col justify-center align-middle  gap-1">
                <Text
                  style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                  className="text-[#F4F1D6] ">
                  Name:
                </Text>
                <Text className=" text-black bg-[#F5DEB3]  w-auto px-2 rounded-lg  p-1">
                  Previous Name: {customer?.custName}
                </Text>
                <TextInput
                  name="custName"
                  value={custName || ''}
                  onChangeText={setCustName}
                  placeholder="Enter Customer Name"
                  className=" text-black bg-white w-auto px-2 rounded-lg  p-1"></TextInput>
              </View>
              <View className="mb-5 flex-col justify-center align-middle  gap-1">
                <Text
                  style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                  className="text-[#F4F1D6] ">
                  Number:
                </Text>
                <Text className=" text-black bg-[#F5DEB3]  w-auto px-2 rounded-lg  p-1">
                  Previous Number: {customer?.custNumber}
                </Text>
                <TextInput
                  placeholder="Enter New Number "
                  name="custNumber"
                  value={custNumber || ''}
                  onChangeText={text => {
                    if (/^0?5?\d{0,8}$/.test(text) || text === '') {
                      setCustNumber(text);
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  className=" text-black bg-white w-auto px-2 rounded-lg  p-1"></TextInput>
              </View>
              <View className="mb-5 flex-col justify-center align-middle  gap-1">
                <Text
                  style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                  className="text-[#F4F1D6] ">
                  Amount:
                </Text>
                <Text className=" text-black bg-[#F5DEB3]  w-auto px-2 rounded-lg  p-1">
                  Previous Amount: {customer?.custAmount} SAR
                </Text>
                <Text className="text-black bg-white w-auto px-2 rounded-lg p-1 text-center text-lg font-bold">
                  Current: {custAmount} SAR
                </Text>
                <View className="flex-row gap-2 mt-1">
                  <TextInput
                    className="flex-1 rounded-xl bg-green-500 p-[1%] text-black text-2xl text-center"
                    placeholder="+ Add"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    onEndEditing={event =>
                      handleAddAmount(event.nativeEvent.text, 'add')
                    }
                  />
                  <TextInput
                    className="flex-1 bg-red-600 rounded-xl p-[1%] text-black text-2xl text-center"
                    placeholder="- Subtract"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    onEndEditing={event =>
                      handleAddAmount(event.nativeEvent.text, 'sub')
                    }
                  />
                </View>
              </View>
              <View className="mb-5 flex-col justify-center align-middle  gap-1">
                <Text
                  style={[{fontSize: wp(4)}, styles.Text, styles.shadow]}
                  className="text-[#F4F1D6] ">
                  Due Date:
                </Text>
                <Text className=" text-black bg-[#F5DEB3]  w-auto px-2 rounded-lg  p-1">
                  Previous Due Date: {previousDueDate}
                </Text>
                <TouchableOpacity
                  onPress={showDatepicker}
                  title="Show date picker!"
                  placeholder="Enter Mobile Number"
                  className=" text-black bg-white w-auto px-2 rounded-lg flex  ">
                  <Text>
                    Click To Select Due Date:{'\n'}
                    <Text className="font-bold">
                      {custDueDate
                        ? `New Due Date: ${formatDate(custDueDate)}`
                        : 'Select a date'}
                    </Text>
                  </Text>
                </TouchableOpacity>
                {show && (
                  <DateTimePicker
                    value={custDueDate ? new Date(custDueDate) : new Date()} // Ensure it's a valid Date object
                    mode="date"
                    display="default"
                    onChange={onChange}
                  />
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.shadow]}
              // onPress={() => navigation.navigate('EditUser')}
              onPress={handleSubmit}
              className=" bg-gray-900 flex text-center px-2 py-1 rounded-md border-2 border-gray-900">
              <Text
                style={[{fontSize: wp(4)}]}
                className="font-bold text-[#D9D9D9] font-serif text-center flex px-2 ">
                UPDATE
              </Text>
            </TouchableOpacity>
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
