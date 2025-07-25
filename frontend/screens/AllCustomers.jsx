import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import LinearGradient from 'react-native-linear-gradient';
import api from '../../backend/api/api';
import {useNavigation} from '@react-navigation/native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {SearchContext} from '../../backend/context/search';
import {AuthContext} from '../../backend/context/auth';

export default function AllCustomers() {
  const {auth} = useContext(AuthContext);
  const {query} = useContext(SearchContext);
  const navigation = useNavigation();
  const [customers, setCustomers] = useState('');
  const [allcustomers, setAllCustomers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const userId = auth?.user?._id;
  const fetchAllCustomers = async () => {
    try {
      const res = await api.get(
        `/api/v1/customer/all-customers?userId=${userId}`,
      );
      setCustomers(res.data);
      setAllCustomers(res.data);
    } catch (error) {
      console.log('Error Getting Message', error);

      // Alert.alert('Error', 'Failed to Fetch Customers');
    }
  };
  const onRefresh = () => {
    fetchAllCustomers();
  };
  useEffect(() => {
    if ((query ?? '').trim() === '') {
      setCustomers(allcustomers);
    } else {
      const filtered = allcustomers.filter(c =>
        c.custName.toLowerCase().includes(query?.toLowerCase()),
      );
      setCustomers(filtered);
    }
  }, [query, allcustomers]);

  const handleSelectedCustomer = c => {
    navigation.navigate('EditCustomer', {customer: c});
  };

  useEffect(() => {
    fetchAllCustomers();
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
            ALL CUSTOMER'S
          </Text>
          <Text className="m-auto text-[#F4F1D6] text-[18px] font-semibold">
            Total Customers: {customers.length}
          </Text>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <SwipeListView
              data={customers}
              refreshing={refreshing}
              onRefresh={onRefresh}
              keyExtractor={item => item._id}
              nestedScrollEnabled={true}
              renderItem={({item}) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => handleSelectedCustomer(item)}>
                  <View className="bg-[#D9D9D9] w-[100%] h-[65] rounded-xl mb-2 px-3">
                    <View className="absolute p-[2%] flex justify-between flex-row gap-1 ">
                      <View className="flex">
                        <Text
                          style={[
                            {fontSize: wp(5)},
                            {width: wp(40)},
                            {height: hp(2.8)},
                          ]}
                          className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                          {item.custName}
                        </Text>
                        <View className="flex  flex-row w-[170]">
                          <View className="bg-[#D9D9D9]  w-[100%]  rounded-xl pl-3 ">
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

                      <View className="bg-[#D9D9D9] justify-center align-middle items-center text-center rounded-xl flex ">
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
