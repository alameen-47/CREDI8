import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {useSearch} from '../../backend/context/search.js';
import {AuthContext} from '../../backend/context/auth.js';
import debounce from 'lodash.debounce'; // Use lodash debounce for better optimization

export default function Header() {
  const navigation = useNavigation();
  const [drop, setDrop] = useState(1);
  const {removeAuthData} = useContext(AuthContext);
  const {query, results, loading, handleSearch} = useSearch();
  const [inputValue, setInputValue] = useState('');

  const handleSelectedCustomer = item => {
    handleSearch({query: ''});
    navigation.navigate('EditCustomer', {customer: item});
  };

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const debouncedSearch = useCallback(
    debounce(text => {
      // console.log('&&&&&&&&&&&', text, '&&&&&&&&&&&');
      handleSearch(text);
    }, 500),
    [handleSearch],
  );

  return (
    <View className="space-x-12  z-30 bg-[#151E25] flex justify-center items-center align-middle p-2 flex-row">
      <View>
        <Image
          style={{width: wp(15), height: wp(14)}}
          source={require('../assets/icons/Logo-small.png')}
        />
      </View>

      <View className="search-Bar bg-white w-[50%] rounded-3xl p-2 flex-row items-center">
        <TextInput
          className="text-black flex-1 h-10 pl-4"
          style={[{fontSize: wp(3.5)}]}
          value={inputValue}
          onChangeText={text => {
            setInputValue(text);
            debouncedSearch(text);
          }}
          placeholder="Search customer..."
          placeholderTextColor="gray"></TextInput>

        {loading && <ActivityIndicator size="small" color="#0000ff" />}
        {query.length > 0 ? (
          <FlatList
            className="absolute top-[150%] bg-[#151E25] text-white p-2 rounded-b-md"
            data={results}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => handleSelectedCustomer(item)}>
                <Text className="text-white mt-2 text-lg">{item.custName}</Text>
                <Text className="text-white flex-row items-center">
                  {item.custNumber}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          // If no results, show nothing or a message (optional)
          <Text></Text>
        )}
      </View>
      <View>
        {drop === 1 ? (
          <TouchableOpacity onPress={() => setDrop(2)}>
            <Image
              style={{width: wp(9), height: wp(9)}}
              source={require('../assets/icons/Hamburger-Menu.png')}
            />
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity onPress={() => setDrop(1)}>
              <Image
                style={{width: wp(6), height: wp(6)}}
                source={require('../assets/icons/X-icon.png')}
              />
            </TouchableOpacity>
            {/* //List items */}
            <View className="absolute top-[40px] w-[150px] p-3 justify-between space-y-5  bg-[#151E25] right-[-14] rounded-bl-xl ">
              <TouchableOpacity
                onPress={navigateToUserDetails}
                className="flex flex-row gap-x-3">
                <Image
                  style={{width: wp(7), height: wp(7)}}
                  source={require('../assets/icons/User.png')}
                />
                <Text className="text-[#F4F1D6]  font-serif font-bold text-center text-lg">
                  User Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditUser')}
                className="flex flex-row gap-x-3">
                <Image
                  style={{width: wp(7), height: wp(7)}}
                  source={require('../assets/icons/adminEdit.png')}
                />
                <Text className="text-[#F4F1D6]  font-serif font-bold text-center text-lg">
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await removeAuthData(); // Remove auth data
                  navigation.navigate('LogIn'); // Navigate to LogIn screen
                }}
                className="flex flex-row gap-x-3">
                <Image
                  style={{width: wp(7), height: wp(7)}}
                  source={require('../assets/icons/Logout.png')}
                />
                <Text className="text-[#F4F1D6]  font-serif font-bold text-center text-lg">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
