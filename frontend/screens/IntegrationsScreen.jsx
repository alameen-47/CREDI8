import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Layout from './Layout';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import api from '../../backend/api/api';
import {useToast} from 'react-native-toast-notifications';

export default function IntegrationsScreen() {
  const toast = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/integrations/keys');
      setKeys(res.data?.data || []);
    } catch (e) {
      toast.show(e.response?.data?.message || 'Could not load API keys');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const createKey = async () => {
    setBusy(true);
    try {
      const res = await api.post('/api/v1/integrations/keys', {
        name: name.trim() || 'default',
      });
      if (res.data?.key) {
        Alert.alert(
          'API key created',
          `Copy it now — it will not be shown again:\n\n${res.data.key}`,
          [{text: 'OK', onPress: () => load()}],
        );
        setName('');
      }
    } catch (e) {
      toast.show(e.response?.data?.message || 'Could not create key');
    }
    setBusy(false);
  };

  const revoke = id => {
    Alert.alert('Revoke key', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/v1/integrations/keys/${id}`);
            toast.show('Key revoked');
            load();
          } catch (e) {
            toast.show(e.response?.data?.message || 'Revoke failed');
          }
        },
      },
    ]);
  };

  return (
    <Layout>
      <ScrollView className="flex-1 px-2">
        <Text
          style={{fontSize: wp(6)}}
          className="text-[#F4F1D6] font-bold mb-2 mt-2">
          API keys
        </Text>
        <Text className="text-[#D9D9D9] text-sm mb-4 leading-5">
          Use these keys for server-to-server or automation integrations. Store
          them only in secure environment variables — never in client bundles.
          Creating keys requires a Pro or Enterprise plan.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Key label (optional)"
          placeholderTextColor="#888"
          className="bg-[#F4F1D6] rounded-lg px-3 py-2 mb-2 text-[#151E25]"
        />
        <TouchableOpacity
          disabled={busy}
          onPress={createKey}
          className="bg-[#775948] rounded-xl py-3 px-4 mb-6">
          <Text className="text-[#F4F1D6] text-center font-bold">
            Generate new key
          </Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator color="#F4F1D6" />
        ) : keys.length === 0 ? (
          <Text className="text-[#D9D9D9]">No active keys.</Text>
        ) : (
          keys.map(k => (
            <View
              key={k._id}
              className="border border-[#775948]/50 rounded-lg p-3 mb-2">
              <Text className="text-[#F4F1D6] font-semibold">
                {k.name || 'default'}
              </Text>
              <Text className="text-[#AB785B] text-sm">{k.keyPrefix}…</Text>
              <TouchableOpacity onPress={() => revoke(k._id)} className="mt-2">
                <Text className="text-red-300">Revoke</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </Layout>
  );
}
