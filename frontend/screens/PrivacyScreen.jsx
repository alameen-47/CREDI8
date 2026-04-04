import {View, Text, ScrollView, Linking, TouchableOpacity} from 'react-native';
import React from 'react';
import Layout from './Layout';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const PRIVACY_URL = 'https://example.com/cred8-privacy';

export default function PrivacyScreen() {
  return (
    <Layout>
      <ScrollView className="flex-1 px-3 py-2">
        <Text
          style={{fontSize: wp(6)}}
          className="text-[#F4F1D6] font-bold mb-3">
          Privacy
        </Text>
        <Text className="text-[#D9D9D9] mb-3 leading-6">
          CREDI8 processes account data and customer contact information you
          provide to operate call and messaging automation. Microphone access is
          not required for server-initiated calls. Replace this screen with your
          live policy before store submission.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(PRIVACY_URL)}
          className="mb-6">
          <Text className="text-[#e99b35] underline text-base">
            View privacy policy (placeholder URL)
          </Text>
        </TouchableOpacity>
        <Text className="text-[#F4F1D6] font-semibold mb-1">
          Data we use
        </Text>
        <Text className="text-[#D9D9D9] mb-3 leading-6">
          Email, name, phone, customer records you add, call metadata, billing
          records from Razorpay (payments), and technical logs for security.
        </Text>
      </ScrollView>
    </Layout>
  );
}
