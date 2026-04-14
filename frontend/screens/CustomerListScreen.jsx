import React, {useState, useEffect, useContext} from 'react';
import {View, Text, ScrollView, RefreshControl, Image, StyleSheet} from 'react-native';
import Layout from './Layout';
import LinearGradient from 'react-native-linear-gradient';
import api from '../services/api';
import {AuthContext} from '../context/auth';
import {useToast} from 'react-native-toast-notifications';

const CustomerListScreen = () => {
  const [customerData, setCustomerData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {auth} = useContext(AuthContext);
  const userId = auth?.user?._id;
  const toast = useToast();

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/v1/customer/all-customers', {
        params: {userId},
      });
      // API now returns { success, data, pagination }
      const list = res.data?.data ?? res.data;
      setCustomerData(Array.isArray(list) ? list : []);
    } catch {
      toast.show('Failed to load customers', {type: 'danger'});
    }
  };

  useEffect(() => {
    if (userId) fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCustomers();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getIcon = (paid) => paid ? require('../assets/icons/CheckMark.png') : require('../assets/icons/Pending.png');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 15,
    },
    content: {
      flex: 1,
      paddingTop: 50,
      padding: 20,
      zIndex: 1,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Arial Rounded MT Bold',
      color: '#F4F1D6',
      textAlign: 'center',
      marginBottom: 20,
    },
    item: {
      flexDirection: 'row',
      backgroundColor: 'rgba(217, 217, 217, 0.9)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
    },
    icon: {
      width: 40,
      height: 40,
      marginRight: 12,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#775948',
      marginBottom: 4,
    },
    phone: {
      fontSize: 16,
      color: '#775948',
      marginBottom: 4,
    },
    dates: {
      marginBottom: 4,
    },
    amount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#775948',
    },
  });

  return (
    <Layout>
      <View style={styles.container}>
        <LinearGradient 
          colors={['#151E25', '#775948', '#AB785B']} 
          style={styles.gradient} 
        />
        <View style={styles.content}>
          <Text style={styles.title}>CUSTOMER LIST</Text>
          <ScrollView 
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#F4F1D6']}
              />
            }
          >
            {customerData.map((c, index) => (
              <View key={c._id || index} style={styles.item}>
                <Image source={getIcon(c.paid)} style={styles.icon} />
                <View style={styles.info}>
                  <Text style={styles.name}>{c.custName}</Text>
                  <Text style={styles.phone}>{c.custNumber}</Text>
                  <Text style={styles.dates}>Due: {formatDate(c.custDueDate)}</Text>
                </View>
                <Text style={styles.amount}>{c.custAmount} SAR</Text>
              </View>
            ))}
            {customerData.length === 0 && (
              <Text style={{textAlign: 'center', color: '#D9D9D9', fontSize: 16, marginTop: 50}}>
                No customers yet. Add some from sidebar.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Layout>
  );
};

export default CustomerListScreen;

