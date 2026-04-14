import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import api from '../services/api';
import {AuthContext} from '../context/auth';
import {useToast} from 'react-native-toast-notifications';

export default function PaidList() {
  const [refreshing, setRefreshing] = useState(false);
  const {auth} = useContext(AuthContext);
  const userId = auth?.user?._id;
  const [customerData, setCustomerData] = useState([]);
  const toast = useToast();

  const fetchPaidCustomer = async () => {
    try {
      const res = await api.get('/api/v1/customer/all-customers', {
        params: {userId, paid: 'true'},
      });
      const list = res.data?.data ?? res.data;
      setCustomerData(Array.isArray(list) ? list : []);
    } catch {
      toast.show('Failed to load paid customers', {type: 'danger'});
    }
  };

  useEffect(() => {
    if (userId) fetchPaidCustomer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPaidCustomer();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    return dateStr.split('T')[0].split('-').reverse().join('/');
  };

  return (
    <Layout>
      <View style={{...styles.glassEffect, borderRadius: 15}}>
        <LinearGradient
          colors={['#151E25', '#775948', '#AB785B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{flex: 1, borderRadius: 15}}
          className="opacity-70"
        />
        <View
          style={styles.contentContainer}
          className="absolute z-50 opacity-100 w-[100%] h-[100%]">
          <Text
            style={[{fontSize: wp(7)}, styles.Text, styles.shadow]}
            className="text-center mt-[10%] text-[#F4F1D6]">
            PAID CUSTOMER LIST
          </Text>
          <ScrollView
            nestedScrollEnabled={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#F4F1D6']}
              />
            }>
            {customerData.length === 0 && !refreshing ? (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#D9D9D9',
                  fontSize: 16,
                  marginTop: 50,
                }}>
                No paid customers yet.
              </Text>
            ) : (
              customerData.map((c, index) => (
                <View key={c._id || index} className="">
                  <View className="bg-black opacity-30 w-[100%] h-[65] rounded-xl mb-2" />
                  <Image
                    style={{width: wp(9), height: wp(9)}}
                    className="z-50 absolute flex right-[-7] top-[-14]"
                    source={require('../assets/icons/CheckMark.png')}
                  />
                  <View className="absolute p-[2%] flex justify-between flex-row gap-1">
                    <View className="flex">
                      <Text
                        style={[{fontSize: wp(5)}]}
                        className="bg-[#D9D9D9] w-[100%] rounded-xl font-bold text-[#775948] mb-1 pl-2">
                        {c.custName}
                      </Text>
                      <View className="flex justify-between align-middle items-center flex-row w-[170]">
                        <View className="bg-[#D9D9D9] w-auto px-2 rounded-xl">
                          <Text
                            style={[{fontSize: wp(2.5)}]}
                            className="font-bold text-[#775948] text-center">
                            Phone
                          </Text>
                          <Text
                            style={[{fontSize: wp(2)}]}
                            className="font-bold text-[#775948] text-center">
                            {c.custNumber}
                          </Text>
                        </View>
                        <View className="bg-[#D9D9D9] w-auto px-5 rounded-xl">
                          <Text
                            style={[{fontSize: wp(2.5)}]}
                            className="font-bold text-[#775948] text-center">
                            Due Date
                          </Text>
                          <Text
                            style={[{fontSize: wp(2)}]}
                            className="font-bold text-[#775948] text-center">
                            {formatDate(c.custDueDate)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="w-[30%] rounded-xl flex justify-around bottom-1 gap-1">
                      <View className="bg-[#D9D9D9] rounded-xl flex">
                        <Text
                          style={[{fontSize: wp(5)}]}
                          className="text-[#775948] text-center font-extrabold w-[100%] h-auto py-[1%] mx-[1%]">
                          {c.custAmount}
                        </Text>
                      </View>
                      <View className="bg-[#D9D9D9] px-[2] rounded-xl">
                        <Text
                          style={[{fontSize: wp(2)}]}
                          className="font-bold text-[#775948] text-center">
                          SAR — Paid
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
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
    shadowColor: '#000000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 8,
  },
  glassEffect: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    zIndex: 10,
  },
});
