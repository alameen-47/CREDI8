import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {useNavigation} from '@react-navigation/native';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const PLANS = [
  {
    id: 'free',
    title: 'Free',
    desc: '50 calls/mo · 60 min · 200 API req/day — get started at no cost.',
    cta: 'Current tier',
    target: null,
  },
  {
    id: 'pro',
    title: 'Pro',
    desc: '500 calls/mo · 600 min · 2k API req/day — for growing teams.',
    cta: 'Upgrade to Pro',
    target: 'pro',
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    desc: 'Unlimited usage — for high volume and custom needs.',
    cta: 'Upgrade to Enterprise',
    target: 'enterprise',
  },
];

export default function PlanSelectScreen() {
  const navigation = useNavigation();

  return (
    <Layout>
      <ScrollView className="flex-1 px-3 py-4">
        <Text
          style={{fontSize: wp(6)}}
          className="text-[#F4F1D6] font-bold mb-2">
          Choose a plan
        </Text>
        <Text className="text-[#D9D9D9] text-sm mb-6 leading-5">
          Free stays on-device limits. Paid plans use Razorpay checkout (or mock
          mode when MOCK_MODE=true on the server).
        </Text>
        {PLANS.map(p => (
          <View
            key={p.id}
            className="border border-[#775948]/60 rounded-xl p-4 mb-4 bg-[#151E25]/80">
            <Text className="text-[#F4F1D6] text-xl font-bold">{p.title}</Text>
            <Text className="text-[#D9D9D9] text-sm mt-2 leading-5">{p.desc}</Text>
            {p.target ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Billing', {preselectPlan: p.target})
                }
                className="bg-[#775948] rounded-lg py-3 px-4 mt-4">
                <Text className="text-[#F4F1D6] text-center font-bold">
                  {p.cta}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-[#AB785B] text-sm mt-4">{p.cta}</Text>
            )}
          </View>
        ))}
        <TouchableOpacity
          onPress={() => navigation.navigate('Billing')}
          className="py-3 mb-8">
          <Text className="text-[#e99b35] text-center underline">
            Open full billing & history
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
}
