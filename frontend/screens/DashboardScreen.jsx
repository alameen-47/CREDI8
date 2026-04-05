import {View, Text, ScrollView, RefreshControl, ActivityIndicator} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import api from '../services/api';
import {useToast} from 'react-native-toast-notifications';

export default function DashboardScreen() {
  const toast = useToast();
  const [usage, setUsage] = useState(null);
  const [calls, setCalls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, c] = await Promise.all([
        api.get('/api/v1/usage/summary'),
        api.get('/api/v1/calls/history?limit=20'),
      ]);
      setUsage(u.data?.data);
      setCalls(c.data?.data || []);
    } catch (e) {
      toast.show(
        e.response?.data?.message || 'Could not load dashboard',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const lim = usage?.limits;
  const use = usage?.usage;

  return (
    <Layout>
      <ScrollView
        className="flex-1 px-2"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Text
          style={{fontSize: wp(6)}}
          className="text-[#F4F1D6] font-bold mb-3 mt-2">
          Usage & calls
        </Text>
        {loading ? (
          <ActivityIndicator color="#F4F1D6" />
        ) : (
          <>
            <View className="bg-[#151E25]/90 border border-[#775948] rounded-xl p-3 mb-3">
              <Text className="text-[#AB785B] font-semibold mb-1">Plan</Text>
              <Text className="text-[#F4F1D6] text-lg capitalize">
                {usage?.plan || 'free'}
              </Text>
              <Text className="text-[#D9D9D9] text-sm mt-2">
                Calls this month: {use?.callsThisMonth ?? 0}
                {lim?.maxCallsPerMonth != null &&
                Number.isFinite(lim.maxCallsPerMonth)
                  ? ` / ${lim.maxCallsPerMonth}`
                  : ''}
              </Text>
              <Text className="text-[#D9D9D9] text-sm">
                Minutes this month: {use?.minutesThisMonth ?? 0}
                {lim?.maxCallMinutesPerMonth != null &&
                Number.isFinite(lim.maxCallMinutesPerMonth)
                  ? ` / ${lim.maxCallMinutesPerMonth}`
                  : ''}
              </Text>
            </View>
            <Text className="text-[#F4F1D6] font-bold mb-2">Recent calls</Text>
            {calls.length === 0 ? (
              <Text className="text-[#D9D9D9]">No call activity yet.</Text>
            ) : (
              calls.map(log => (
                <View
                  key={log._id}
                  className="bg-[#151E25]/80 border border-[#775948]/50 rounded-lg p-2 mb-2">
                  <Text className="text-[#F4F1D6]">
                    To: {log.toNumber || '—'}
                  </Text>
                  <Text className="text-[#AB785B] text-sm capitalize">
                    {log.status}
                  </Text>
                  {log.errorMessage ? (
                    <Text className="text-red-300 text-xs mt-1">
                      {log.errorMessage}
                    </Text>
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
