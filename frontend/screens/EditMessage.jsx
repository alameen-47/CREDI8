import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import React, {useContext, useEffect, useId, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../backend/api/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useToast} from 'react-native-toast-notifications';
import {AuthContext} from '../../backend/context/auth';

export default function EditMessage() {
  const toast = useToast();
  const {auth} = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null);
  const [existingMessage, setExistingMessage] = useState('');
  const [existingDate, setExistingDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  console.log('$$$$$$$$$$$', message, '$$$$$$$$$$$$$');
  console.log('$$$$$$$$$$$', scheduledAt, '$$$$$$$$$$$$$');

  const userId = auth?.user?._id;
  const createScheduledMessage = async (message, scheduledAt) => {
    try {
      const formattedDate =
        scheduledAt instanceof Date ? scheduledAt.toISOString() : '';
      const formattedMessage =
        typeof message === 'string' ? message : JSON.stringify(message);

      const res = await api.post(`/api/v1/customer/create-message`, {
        message: formattedMessage,
        scheduledAt: formattedDate,
        userId,
      });
      toast.show('Messsage SET and Scheduled Successfully ');
      console.log('Message Created Succesfully', res.data);
    } catch (error) {
      console.log('Error Creating Message', error);
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || scheduledAt;
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      setScheduledAt(currentDate);
    }
  };
  const showDatepicker = () => {
    setShow(true);
  };
  const formatDate = date => {
    if (!date) return 'Select a DAte';
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const getMessage = async () => {
    try {
      const res = await api.get(
        `/api/v1/customer/get-message?userId=${userId}`,
      );
      const {message, scheduledAt} = res.data;

      setExistingMessage(message);
      setExistingDate(
        new Date(scheduledAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      );
      console.log('Message:', message);
      console.log('Scheduled Date:', scheduledAt);
    } catch (error) {
      console.log('Error Getting Message', error);
    }
  };
  useEffect(() => {
    getMessage();
  }, []);
  const onRefresh = () => {
    getMessage();
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
            EDIT MESSAGE
          </Text>
          <ScrollView
            nestedScrollEnabled={true}
            className=""
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View
              style={[{width: 275, height: 580}, styles.shadow]}
              className="bg-[#D9D9D9] rounded-lg py-3 align-middle items-center space-y-2">
              <View>
                <Text
                  style={[
                    {fontSize: wp(5)},
                    {width: wp(60)},
                    {height: hp(3.8)},
                  ]}
                  className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                  Previous Message:
                </Text>
                <View
                  style={[{width: wp(60), height: wp(30)}]}
                  className="bg-white rounded-lg">
                  <Text
                    style={{fontSize: wp(4), flexWrap: 'wrap'}}
                    className="p-3">
                    {existingMessage}
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    {fontSize: wp(5)},
                    {width: wp(60)},
                    {height: hp(3.8)},
                  ]}
                  className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                  New Message:
                </Text>
                <View
                  style={[{width: wp(60), height: wp(30)}]}
                  className="bg-white rounded-lg">
                  <TextInput
                    multiline={true}
                    onChangeText={text => setMessage(text)}
                    style={{fontSize: wp(4)}}
                    className="p-3"></TextInput>
                </View>
                <View className="" style={[{width: wp(60), height: wp(30)}]}>
                  <View>
                    <Text
                      style={[
                        {fontSize: wp(5)},
                        {width: wp(60)},
                        {height: hp(3.8)},
                      ]}
                      className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                      Previous Due Date:
                    </Text>
                    <Text className="bg-white rounded-lg px-2 font-bold text-lg">
                      {existingDate}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        {fontSize: wp(5)},
                        {width: wp(60)},
                        {height: hp(3.8)},
                      ]}
                      className="bg-[#D9D9D9]   rounded-xl font-bold text-[#775948] mb-1 pl-2">
                      New Due Date:
                    </Text>
                    <TouchableOpacity onPress={showDatepicker}>
                      {show && (
                        <DateTimePicker
                          mode="date"
                          value={
                            scheduledAt ? new Date(scheduledAt) : new Date()
                          }
                          display="default"
                          onChange={onChange}
                        />
                      )}
                      <Text className="bg-white rounded-lg px-2 font-bold text-lg">
                        {formatDate(scheduledAt)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View></View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.shadow]}
                onPress={() => createScheduledMessage(message, scheduledAt)}
                className=" bg-gray-900 flex text-center  top-[2%]  px-2 py-1 rounded-md border-2 border-gray-900">
                <Text
                  style={[{fontSize: wp(4)}]}
                  className="font-bold text-[#D9D9D9] font-serif px-[10%] ">
                  UPDATE MESSAGE
                </Text>
              </TouchableOpacity>
            </View>
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
    shadowColor: '#000000', // Corrected color code
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8, // Valid opacity value
    shadowRadius: 9,
    elevation: 8, // This will work on Android
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
