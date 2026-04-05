import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import React, {useCallback, useContext, useState} from 'react';
import Layout from './Layout';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useToast} from 'react-native-toast-notifications';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../services/api';
import {AuthContext} from '../../backend/context/auth';

const TIER_COPY = {
  free: {
    title: 'Free',
    bullets: ['50 calls / month', '60 minutes / month', '200 API requests / day'],
  },
  pro: {
    title: 'Pro',
    bullets: ['500 calls / month', '600 minutes / month', '2,000 API requests / day'],
  },
  enterprise: {
    title: 'Enterprise',
    bullets: ['Unlimited calls', 'Unlimited minutes', 'Unlimited API requests'],
  },
};

export default function BillingScreen() {
  const toast = useToast();
  const route = useRoute();
  const {auth, saveAuthData} = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const highlightPlan = route.params?.preselectPlan || null;

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/billing/summary');
      setSummary(res.data);
    } catch (e) {
      toast.show(e.response?.data?.message || 'Could not load billing');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const paid = Boolean(summary?.hasPaidPlan);
  const plan = summary?.plan || 'free';

  const runCheckout = async planCode => {
    if (!auth?.user || !auth?.token) {
      toast.show('Please sign in again');
      return;
    }
    setBusy(true);
    try {
      const start = await api.post('/api/v1/billing/subscription/start', {
        planCode,
      });
      const payload = start.data?.data || {};
      const {keyId, subscriptionId, mock, mockProof} = payload;
      if (!keyId || !subscriptionId) {
        toast.show(start.data?.message || 'Could not start checkout');
        setBusy(false);
        return;
      }

      let verifyBody;
      if (mock && mockProof) {
        verifyBody = mockProof;
      } else if (mock) {
        verifyBody = {
          mockConfirm: true,
          subscriptionId,
        };
      } else {
        const options = {
          key: keyId,
          subscription_id: subscriptionId,
          name: 'CREDI8',
          description:
            planCode === 'enterprise'
              ? 'Enterprise subscription'
              : 'Pro subscription',
          prefill: {
            email: auth.user.email || '',
            contact: String(auth.user.phone || '').replace(/\D/g, '').slice(-15),
            name: auth.user.name || '',
          },
          theme: {color: '#775948'},
        };

        const data = await RazorpayCheckout.open(options);
        verifyBody = {
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_subscription_id:
            data.razorpay_subscription_id || subscriptionId,
          razorpay_signature: data.razorpay_signature,
        };
      }

      const verify = await api.post(
        '/api/v1/billing/verify-subscription',
        verifyBody,
      );

      if (verify.data?.success && verify.data?.plan && auth.token) {
        await saveAuthData(
          {...auth.user, plan: verify.data.plan},
          auth.token,
        );
        toast.show('Subscription active');
        await load();
      } else {
        toast.show(verify.data?.message || 'Verification incomplete');
      }
    } catch (err) {
      const code = err?.code;
      const desc =
        err?.error?.description ||
        err?.description ||
        err?.message ||
        'Payment failed';
      if (code === 0 || /cancel/i.test(String(desc))) {
        toast.show('Payment cancelled');
      } else {
        toast.show(desc);
      }
    }
    setBusy(false);
  };

  const cancelSub = async () => {
    setBusy(true);
    try {
      await api.post('/api/v1/billing/subscription/cancel', {});
      if (auth?.user && auth?.token) {
        await saveAuthData({...auth.user, plan: 'free'}, auth.token);
      }
      toast.show('Subscription cancellation scheduled');
      await load();
    } catch (e) {
      toast.show(e.response?.data?.message || 'Could not cancel');
    }
    setBusy(false);
  };

  const openPolicy = () => {
    Linking.openURL(
      Platform.OS === 'ios'
        ? 'https://developer.apple.com/app-store/review/guidelines/'
        : 'https://support.google.com/googleplay/android-developer/answer/9857753',
    );
  };

  return (
    <Layout>
      <ScrollView className="flex-1 px-2">
        <Text
          style={{fontSize: wp(6)}}
          className="text-[#F4F1D6] font-bold mb-3 mt-2">
          Plans & billing
        </Text>
        <Text className="text-[#AB785B] text-xs mb-3 leading-5">
          Payments are processed with Razorpay. For App Store / Play Store digital
          goods rules, confirm your distribution strategy with counsel — some
          regions require platform billing for certain in-app purchases.
        </Text>
        <TouchableOpacity onPress={openPolicy} className="mb-4">
          <Text className="text-[#e99b35] underline text-xs">
            Platform billing policy references
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color="#F4F1D6" />
        ) : (
          <>
            <View className="bg-[#151E25]/90 border border-[#775948] rounded-xl p-3 mb-4">
              <Text className="text-[#F4F1D6] font-semibold capitalize">
                Current: {plan}
              </Text>
              <Text className="text-[#D9D9D9] text-sm mt-1">
                Status: {summary?.subscriptionStatus || '—'}
              </Text>
              <Text className="text-[#D9D9D9] text-xs mt-2">
                Backend:{' '}
                {summary?.billingConfigured ? (
                  <Text className="text-green-400">ready</Text>
                ) : (
                  <Text className="text-amber-300">
                    Configure RAZORPAY_* or MOCK_MODE=true
                  </Text>
                )}
                {' · '}
                Webhook:{' '}
                {summary?.mockMode ? (
                  <Text className="text-[#AB785B]">simulated</Text>
                ) : summary?.webhookConfigured ? (
                  <Text className="text-green-400">set</Text>
                ) : (
                  <Text className="text-amber-300">add webhook secret</Text>
                )}
              </Text>
              {summary?.mockMode ? (
                <Text className="text-[#AB785B] text-xs mt-2">
                  MOCK_MODE: payments & calls are simulated — add keys and set
                  MOCK_MODE=false for production.
                </Text>
              ) : null}
            </View>

            {['free', 'pro', 'enterprise'].map(tier => {
              const copy = TIER_COPY[tier];
              const isCurrent = plan === tier;
              const canBuyPro =
                tier === 'pro' &&
                !paid &&
                summary?.billingConfigured &&
                !isCurrent;
              const canBuyEnt =
                tier === 'enterprise' &&
                !paid &&
                summary?.billingConfigured &&
                summary?.enterpriseConfigured &&
                !isCurrent;

              return (
                <View
                  key={tier}
                  className={`rounded-xl p-3 mb-3 border ${
                    highlightPlan === tier
                      ? 'border-2 border-[#e99b35] bg-[#151E25]'
                      : 'border-[#775948]/50'
                  }`}>
                  <Text className="text-[#F4F1D6] font-bold">{copy.title}</Text>
                  {copy.bullets.map(b => (
                    <Text key={b} className="text-[#D9D9D9] text-sm mt-1">
                      • {b}
                    </Text>
                  ))}
                  {isCurrent ? (
                    <Text className="text-[#AB785B] text-sm mt-2">Current plan</Text>
                  ) : null}
                  {canBuyPro ? (
                    <TouchableOpacity
                      disabled={busy}
                      onPress={() => runCheckout('pro')}
                      className="bg-[#775948] rounded-lg py-2 px-3 mt-3">
                      <Text className="text-[#F4F1D6] text-center font-bold">
                        Subscribe with Razorpay (Pro)
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {canBuyEnt ? (
                    <TouchableOpacity
                      disabled={busy}
                      onPress={() => runCheckout('enterprise')}
                      className="bg-[#151E25] border border-[#AB785B] rounded-lg py-2 px-3 mt-3">
                      <Text className="text-[#F4F1D6] text-center font-bold">
                        Subscribe with Razorpay (Enterprise)
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {tier === 'enterprise' &&
                  !summary?.enterpriseConfigured &&
                  !isCurrent ? (
                    <Text className="text-amber-300 text-xs mt-2">
                      Set RAZORPAY_PLAN_ID_ENTERPRISE on the server to enable.
                    </Text>
                  ) : null}
                </View>
              );
            })}

            {paid ? (
              <TouchableOpacity
                disabled={busy}
                onPress={cancelSub}
                className="bg-[#F4F1D6] rounded-xl py-3 px-4 mb-4">
                <Text className="text-[#151E25] text-center font-bold">
                  Cancel subscription (end of cycle)
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text className="text-[#F4F1D6] font-bold mb-2">Payment history</Text>
            {(summary?.payments || []).length === 0 ? (
              <Text className="text-[#D9D9D9] mb-6">No payments recorded yet.</Text>
            ) : (
              summary.payments.map(p => (
                <View
                  key={String(p.id)}
                  className="border border-[#775948]/40 rounded-lg p-2 mb-2">
                  <Text className="text-[#F4F1D6]">{p.type}</Text>
                  <Text className="text-[#AB785B] text-sm">{p.status}</Text>
                  {p.amountMinor != null ? (
                    <Text className="text-[#D9D9D9] text-xs">
                      {(p.amountMinor / 100).toFixed(2)} {p.currency || 'INR'}
                    </Text>
                  ) : null}
                  {p.hostedInvoiceUrl ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(p.hostedInvoiceUrl)}
                      className="mt-1">
                      <Text className="text-[#e99b35] underline">Open</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Layout>
  );
}
