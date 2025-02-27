import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../backend/api/api';
import {SearchContext} from '../../backend/context/search';
import {Toast, useToast} from 'react-native-toast-notifications';

export default function PaidList() {
  const [customer, setCustomer] = useState();
  const [allCustomer, setAllCustomer] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const {query} = useContext(SearchContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchAllCustomer = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('api/v1/customer/all-customers');
      setCustomer(res.data);
      setAllCustomer(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    fetchAllCustomer();
  };
  useEffect(() => {
    fetchAllCustomer();
  }, []);

  useEffect(() => {
    if ((query ?? '').trim() === '') {
      setCustomer(allCustomer);
    } else {
      const filtered = allCustomer.filter(c =>
        c.custName.toLowerCase().includes(query.toLowerCase()),
      );
      setCustomer(filtered);
    }
  }, [query, allCustomer]);

  const sendMessages = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/customer/send-whatsapp-messages', {
        message,
      });
      if (res & res.data.success) {
        toast.show('Message Sent to All Successfully!!');
      }
    } catch (error) {
      toast.show(`Something went wrong!!! ${error.message} `);
    }
    setLoading(false);
  };
  const callCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/customer/make-call');
      if (res.status.success) {
        toast.show('Call Made to All Successfully!!');
      }
    } catch (error) {
      toast.show(`Something went wrong !!! ${error.message}`);
    }
    setLoading(false);
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
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 w-[100%] h-[100%] space-y-4">
          <Text
            style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
            className=" text-center mt-[10%] text-[#F4F1D6]">
            PENDING CUSTOMER LIST
          </Text>
          <View className="bg-[#D9D9D9] h-9 w-[95%] rounded-lg flex justify-between  align-middle items-center flex-row mx-1 px-[.1rem] gap-[0.rem">
            <Text
              style={[{fontSize: wp(4)}]}
              className=" w-[65%]  rounded-xl font-bold text-[#775948]  pl-2">
              Send Message To All
            </Text>
            <TouchableOpacity onPress={sendMessages} disabled={loading}>
              <View className="bg-black shadow-xl  flex flex-row justify-center items-center align-middle p-1 rounded-lg ">
                <Image
                  style={{width: wp(6), height: wp(6)}}
                  className="z-20"
                  source={require('../assets/icons/message.png')}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={callCustomers} disabled={loading}>
              <View className="bg-black shadow-xl  flex flex-row justify-center items-center align-middle p-1 rounded-lg ">
                <Image
                  style={{width: wp(6), height: wp(6)}}
                  className="z-20"
                  source={require('../assets/icons/call.png')}
                />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView nestedScrollEnabled={true} className="">
            {/* //CUSTOMER DETAILS */}
            {customer &&
              customer?.map((c, index) => (
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
                        {c.custName}
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
                            {/* {c.purchaseDate} */}
                            ""
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
                            {c.custDueDate
                              .split('T')[0]
                              .split('-')
                              .reverse()
                              .join('-')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity className="bg-[#D9D9D9] flex justify-center align-middle items-center m-auto rounded-3xl h-[90%]  w-auto">
                      <Image
                        style={{width: wp(7), height: wp(7)}}
                        className="z-20 mt-2"
                        source={require('../assets/icons/Sent.png')}
                      />
                    </TouchableOpacity>
                    <View className="bg-[#D9D9D9] justify-center align-middle items-center text-center rounded-xl flex  w-[20%]">
                      <Text
                        style={[{fontSize: wp(4)}]}
                        className="text-[#775948] text-center font-extrabold w-auto h-auto   ">
                        {c.custAmount}/-
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
