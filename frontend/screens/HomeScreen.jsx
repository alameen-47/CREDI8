import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <Layout>
      <View className="px-2 py-4">
        <Text
          style={{fontSize: wp(7)}}
          className="text-[#F4F1D6] font-bold mb-2">
          CREDI8
        </Text>
        <Text className="text-[#D9D9D9] mb-6 leading-6">
          Automate reminders and outbound calls. Open analytics, billing, or
          your customer lists from the sidebar.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Dashboard')}
          className="bg-[#775948] rounded-xl py-3 px-4 mb-3">
          <Text className="text-[#F4F1D6] text-center font-bold">
            Usage & call history
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('PlanSelect')}
          className="bg-[#151E25] border border-[#AB785B] rounded-xl py-3 px-4 mb-3">
          <Text className="text-[#F4F1D6] text-center font-bold">
            Choose plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Billing')}
          className="bg-[#151E25] border border-[#775948] rounded-xl py-3 px-4 mb-3">
          <Text className="text-[#F4F1D6] text-center font-bold">
            Billing & payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Integrations')}
          className="bg-[#151E25] border border-[#775948] rounded-xl py-3 px-4 mb-3">
          <Text className="text-[#F4F1D6] text-center font-bold">
            API keys
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Privacy')}
          className="py-2">
          <Text className="text-[#e99b35] text-center underline">
            Privacy & data
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}
