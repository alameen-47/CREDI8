import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../backend/api/api';
import {useNavigation} from '@react-navigation/native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {SearchContext} from '../../backend/context/search';
import {AuthContext} from '../../backend/context/auth';
import {useToast} from 'react-native-toast-notifications';

export default function AllCustomers() {
  const {auth} = useContext(AuthContext);
  const toast = useToast();
  const {query} = useContext(SearchContext);
  const navigation = useNavigation();
  const [customers, setCustomers] = useState('');
  const [allcustomers, setAllCustomers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [paidFocused, setPaidFocused] = useState(false);
  const [pendingFocused, setPendingFocused] = useState(true);
  const [popUp, setPopUp] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const userId = auth?.user?._id;
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [custAmount, setCustAmount] = useState();
  const [selectedCustId, setSelectedCustId] = useState();
  const [messageBody, setMessageBody] = useState();

  const getMessage = async () => {
    try {
      const res = await api.get(
        `/api/v1/customer/get-message?userId=${userId}`,
      );
      const {message, scheduledAt} = res.data;

      setMessageBody(message);
      // setExistingDate(
      //   new Date(scheduledAt).toLocaleDateString('en-GB', {
      //     day: '2-digit',
      //     month: '2-digit',
      //     year: 'numeric',
      //   }),
      // );
      // console.log('Message:', message);
      // console.log('Scheduled Date:', scheduledAt);
    } catch (error) {
      console.log('Error Getting Message', error);
    }
  };

  const handleAddAmount = (text, sign) => {
    const num = Number(text);
    if (sign === 'add') {
      setCustAmount(prev => prev + num);
    } else if (sign === 'sub') {
      setCustAmount(prev => prev - num);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        _id: selectedCustId,
        custAmount: custAmount,
      };
      const res = await api.put('/api/v1/customer/edit-customer', payload);

      if (res && res.data.success) {
        toast.show('Customer Details Updated Succesfully');
        navigation.navigate('AllCustomers');
      }
    } catch (error) {
      console.log(error);
      toast.show('Something Went Wrong!!');
    }
  };
  useEffect(() => {
    if (selectedCustomer?.custAmount !== undefined) {
      setCustAmount(selectedCustomer.custAmount);
      setSelectedCustId(selectedCustomer._id);
    }
  }, [selectedCustomer]);

  const fetchAllCustomers = async (filter = null) => {
    try {
      let url = `/api/v1/customer/all-customers?userId=${userId}`;
      if (filter === 'paid') url += `&paid=true`;
      else if (filter === 'pending') url += `&paid=false`;
      const res = await api.get(url);
      setCustomers(res.data);
      setAllCustomers(res.data);
    } catch (error) {
      console.log('Error Getting Message', error);

      // Alert.alert('Error', 'Failed to Fetch Customers');
    }
  };

  const onRefresh = () => {
    fetchAllCustomers();
    setPaidFocused(false);
    setPendingFocused(false);
  };

  useEffect(() => {
    const search = typeof query === 'string' ? query.trim().toLowerCase() : '';
    const filtered = search
      ? allcustomers.filter(c => c.custName?.toLowerCase().includes(search))
      : allcustomers;
    setCustomers(filtered);
  }, [query, allcustomers]);

  // const handleSelectedCustomer = c => {
  //   navigation.navigate('EditCustomer', {customer: c});
  // };

  useEffect(() => {
    fetchAllCustomers('pending ');
    getMessage();
  }, []);

  const handleDelete = customerId => {
    Alert.alert(
      'Delete Customer !!!',
      'Are you sure you want to delete this customer?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await api.delete(
                `/api/v1/customer/delete/${customerId}`,
              );
              const data = response.data;

              if (data.success) {
                setCustomers(customers.filter(c => c._id !== customerId));
                Alert.alert('Success', 'Customer Deleted Successfully');
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Something Went wrong!');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const sendMessages = async () => {
    toast.show('Sending messages…');
    setActionLoading(true);
    try {
      const res = await api.post('/api/v1/customer/send-whatsapp-messages', {
        messageBody,
        userId,
      });
      if (res && res.data.success) {
        toast.show('Message sent to all customers');
      }
    } catch (error) {
      toast.show(
        error.response?.data?.message ||
          `Something went wrong: ${error.message}`,
      );
    }
    setActionLoading(false);
  };

  const callCustomers = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/api/v1/customer/make-call', {});
      if (res.data?.success) {
        toast.show(res.data.message || 'Calls initiated');
      }
    } catch (error) {
      toast.show(
        error.response?.data?.message ||
          `Something went wrong: ${error.message}`,
      );
    }
    setActionLoading(false);
  };
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
        <Modal
          visible={popUp && selectedCustomer !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPopUp(false)}>
          <TouchableWithoutFeedback onPress={() => setPopUp(false)}>
            <View
              key={selectedCustomer}
              className="POPUP_SCREEN bg-gray-100 rounded-xl z-50 flex top-[40%] left-[18%] justify-center align-middle items-center m-auto absolute "
              style={[{width: wp(77)}, {height: hp(25)}]}>
              <Text className="text-lg font-semibold  text-black">
                Modify{' '}
                <Text className="text-[#775948]">
                  {selectedCustomer?.custName}
                </Text>
                's Due Amount
              </Text>
              <Text className="bg-gray-300 w-full font-bold text-lg">
                Previous Balance - {selectedCustomer?.custAmount} /-
              </Text>
              <View
                className="
              flex flex-row gap-6">
                <View className="bg-green-500 border rounded-xl flex flex-row justify-center align-middle items-center">
                  <Image
                    style={[{width: wp(10)}, {height: hp(5)}]}
                    className="left-[5%]"
                    alt=""
                    resizeMode="contain"
                    source={require('../assets/icons/minus.png')}
                  />
                  <TextInput
                    style={[{width: wp(24)}, {height: hp(7), fontSize: hp(4)}]}
                    className=" rounded-xl"
                    // placeholder="+"
                    placeholderTextColor={'black'}
                    keyboardType="numeric"
                    value={selectedCustomer?.custAmount}
                    onEndEditing={event =>
                      handleAddAmount(event.nativeEvent.text, 'sub')
                    }
                  />
                </View>

                <View className="bg-red-500 border rounded-xl flex flex-row justify-center align-middle items-center">
                  <Image
                    style={[{width: wp(9)}, {height: hp(5)}]}
                    className="left-[5%]"
                    alt=""
                    resizeMode="contain"
                    source={require('../assets/icons/plus.png')}
                  />
                  <TextInput
                    style={[{width: wp(24)}, {height: hp(7), fontSize: hp(4)}]}
                    className="  rounded-xl"
                    // placeholder="+"
                    keyboardType="numeric"
                    placeholderTextColor={'black'}
                    value={selectedCustomer?.custAmount}
                    onEndEditing={event =>
                      handleAddAmount(event.nativeEvent.text, 'add')
                    }
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // handleAddCustomerDueAmount();
                  handleSubmit();
                }}
                style={[{width: wp(30)}, {height: hp(5)}]}
                className="bg-[#113051] flex m-2 justify-center align-middle items-center text-center border rounded-xl">
                <Text className="font-bold text-[#D9D9D9] font-serif text-center text-lg flex px-2 ">
                  UPDATE
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 w-[100%] h-[100%] space-y-4">
          <Text
            style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
            className=" text-center mt-[10%] text-[#F4F1D6]">
            ALL CUSTOMER'S
          </Text>
          <Text className="m-auto text-[#F4F1D6] text-[18px] font-semibold">
            Total Customers: {customers.length}
          </Text>
          <View className="flex flex-row  justify-between">
            <>
              <TouchableOpacity
                onPressIn={() => {
                  setPaidFocused(prev => !prev);
                  setPendingFocused(false);
                  fetchAllCustomers('paid');
                }}
                className={`${
                  paidFocused ? 'bg-[#F4F1D6]' : 'bg-[#775948]'
                } rounded-lg p-[2%] w-[45%] text-center flex align-middle items-center`}>
                <Text
                  className={`${
                    paidFocused ? 'text-[#775948]' : 'text-[#F4F1D6]'
                  } font-bold text-lg`}>
                  PAID
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPressIn={() => {
                  setPendingFocused(prev => !prev);
                  setPaidFocused(false);
                  fetchAllCustomers('pending');
                }}
                className={`${
                  pendingFocused ? 'bg-[#F4F1D6]' : 'bg-[#775948]'
                } rounded-lg p-[2%] w-[45%] text-center flex align-middle items-center`}>
                <Text
                  className={`${
                    pendingFocused ? 'text-[#775948]' : 'text-[#F4F1D6]'
                  } font-bold text-lg`}>
                  PENDING
                </Text>
              </TouchableOpacity>
            </>
          </View>
          {pendingFocused && (
            <View
              style={[{height: hp(5)}, {width: wp(67)}]}
              className="SEND_ICONS flex flex-row flex-end justify-between items-center align-middle space-x-2">
              <TouchableOpacity
                onPress={callCustomers}
                disabled={actionLoading}
                className=" PHONE_CALL bg-[#F4F1D6] rounded-lg flex justify-center align-middlej items-center"
                style={[{height: hp(5)}, {width: wp(30)}]}>
                <Image
                  resizeMode="contain"
                  source={require('../assets/icons/call.png')}
                  alt=""
                  style={[{height: hp(3)}, {width: wp(8)}]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={sendMessages}
                disabled={actionLoading}
                className="WHATSAPP_CALL bg-[#F4F1D6]  rounded-lg flex justify-center align-middlej items-center"
                style={[{height: hp(5)}, {width: wp(30)}]}>
                <Image
                  resizeMode="contain"
                  source={require('../assets/icons/whatsapp.png')}
                  style={[{height: hp(3)}, {width: wp(8)}]}
                  alt=""
                />
              </TouchableOpacity>
            </View>
          )}
          <ScrollView
            className=""
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <>
              <SwipeListView
                data={customers}
                refreshing={refreshing}
                onRefresh={onRefresh}
                keyExtractor={item => item._id}
                nestedScrollEnabled={true}
                renderItem={({item}) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => {
                      setSelectedCustomer(prev =>
                        prev === item ? null : item,
                      );
                      setPopUp(true);
                    }}>
                    <View className="bg-[#F4F1D6] w-[100%] h-[100] rounded-xl mb-2 px-3">
                      <View className="absolute p-[2%] flex justify-between flex-row gap-1 ">
                        <View className="flex">
                          <Text
                            style={[
                              {fontSize: wp(5)},
                              {width: wp(40)},
                              {height: hp(2.8)},
                            ]}
                            className="bg-[#F4F1D6]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                            {item.custName}
                          </Text>
                          <View className="flex  flex-row w-[170]">
                            <View className="bg-[#F4F1D6]  w-[100%]  rounded-xl pl-3 ">
                              <Text
                                style={[{fontSize: wp(2.5)}]}
                                className="font-bold text-[#775948] ">
                                Whatsapp Number:
                              </Text>
                              <Text
                                style={[{fontSize: wp(3)}]}
                                className="font-bold text-[#775948 ">
                                {item.custNumber}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="bg-[#F4F1D6] justify-center align-middle items-center text-center rounded-xl flex ">
                          {item.custDueDate ? (
                            <>
                              <Text
                                style={[{fontSize: wp(3.5)}]}
                                className="text-[#775948] text-center font-extrabold w-auto h-auto t  ">
                                SAR: {item.custAmount} /-
                              </Text>
                              <Text
                                style={[{fontSize: wp(3)}]}
                                className="font-bold text-[#775948 text-center underline">
                                Due Date: {'\n'}
                                {item.custDueDate
                                  .split('T')[0]
                                  .split('-')
                                  .reverse()
                                  .join('-')}
                              </Text>
                            </>
                          ) : (
                            <Text
                              style={[{fontSize: wp(5)}]}
                              className="text-[#775948] text-center font-extrabold w-auto h-auto t  ">
                              ⟦ PAID ⟧
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                renderHiddenItem={({item}) => (
                  <TouchableOpacity
                    className="rounded-xl"
                    onPress={() => handleDelete(item._id)}
                    style={{
                      backgroundColor: 'red',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 75,
                      height: '89%',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}>
                    <Text className=" font-semibold text-lg text-white">
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
                rightOpenValue={-75} // Swipe left to reveal the delete button
              />
            </>
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
