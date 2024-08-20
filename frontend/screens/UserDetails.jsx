import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Layout from './Layout';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import axios from 'axios';

export default function UserDetails() {
  const navigation = useNavigation();
  const toast = useToast();
  const route = useRoute(); // Get route parameters
  const [users, setUsers] = useState([]); // State to store user data
  const {id: userId} = route.params; // Extracting userId from route params

  console.log('User ID:', userId); // Add this line to check if userId is being received

  //initial details
  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  // Check if userId is available
  if (!userId) {
    console.error('User ID is missing from route parameters');
    return <Text>No User ID provided</Text>;
  }
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `http://10.0.2.2:8086/api/v1/auth/user/${userId}`,
      );
      setUsers(response.data.users);
    } catch (err) {
      console.error(
        'Error fetching user data:',
        err.response ? err.response.data : err.message,
      );
      toast.show('Failed to fetch user data', {type: 'danger'});
    }
  };

  return (
    <Layout>
      <View
        style={{width: wp(77)}}
        className=" bg-[#D9D9D9] flex-1  align-middle items-center   px-6 rounded-lg ">
        <Text
          style={[{fontSize: wp(8)}, styles.text, styles.shadow]}
          className="  mt-20 text-[#775948]">
          USER PROFILE
        </Text>
        {users?.map(u => (
          <View className="mt-8 w-[100%]">
            <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
              <Text
                style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
                className="text-[#775948]  ">
                Name:
              </Text>
              <Text
                style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
                className="text-[#66636D]  ">
                {u.name}
              </Text>
            </View>
            <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
              <Text
                style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
                className="text-[#775948]  ">
                Email:
              </Text>
              <Text
                style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
                className="text-[#66636D]  ">
                {u.email}
              </Text>
            </View>
            <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
              <Text
                style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
                className="text-[#775948]  ">
                Whatsapp:
              </Text>
              <Text
                style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
                className="text-[#66636D]  ">
                {u.phone}
              </Text>
            </View>
            <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
              <Text
                style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
                className="text-[#775948]  ">
                Mobile:
              </Text>
              <Text
                style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
                className="text-[#66636D]  ">
                +422 481 222 32
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.shadow]}
          onPress={() => navigation.navigate('EditUser')}
          className=" bg-gray-900 flex text-center top-10   px-2 py-1 rounded-md border-2 border-gray-900">
          <Text
            style={[{fontSize: wp(5)}]}
            className="font-bold text-[#D9D9D9] font-serif px-[10%] text-center ">
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Arial Rounded MT Bold',
    // Make sure this matches the font's name
  },
  shadow: {
    shadowColor: '#00000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.8,
    shadowRadius: 7,
    elevation: 8,
  },
});
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import Layout from './Layout';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// import {useNavigation} from '@react-navigation/native';
// import {useToast} from 'react-native-toast-notifications';
// import {useRoute} from '@react-navigation/native'; // For React Navigation
// import axios from 'axios';

// export default function UserDetails() {
//   const navigation = useNavigation();
//   const toast = useToast();
//   const route = useRoute(); // Get route parameters
//   const {id} = route.params || {};
//   const [users, setUsers] = useState([]); // State to store user data
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         // const response = await axios.get('/api/v1/auth/user');
//         const response = await axios.get(
//           'http://localhost:8086/api/v1/auth/user',
//         );
//         const {users} = response.data;

//         setUsers(users);
//       } catch (err) {
//         setError('Error fetching user data ' + err);
//         toast.show('Error fetching user data', {type: 'danger'});
//       } finally {
//         setLoading(false); // Set loading to false after data fetch or error
//       }
//     };

//     fetchUsers();
//   }, []);

//   if (loading) {
//     return (
//       <ActivityIndicator
//         style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
//         size="large"
//         color="#0000ff"
//       />
//     );
//   }

//   if (error) {
//     return <Text>Error: {error}</Text>;
//   }

//   return (
//     <Layout>
//       <View
//         style={{width: wp(77)}}
//         className=" bg-[#D9D9D9] flex-1  align-middle items-center   px-6 rounded-lg ">
//         <Text
//           style={[{fontSize: wp(8)}, styles.text, styles.shadow]}
//           className="  mt-20 text-[#775948]">
//           USER PROFILE
//         </Text>
//         {users.map(u => (
//           <View key={u._id} className="mt-8 w-[100%]">
//             <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
//               <Text
//                 style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
//                 className="text-[#775948]  ">
//                 Name:
//               </Text>
//               <Text
//                 style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
//                 className="text-[#66636D]  ">
//                 {u.name}
//               </Text>
//             </View>
//             <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
//               <Text
//                 style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
//                 className="text-[#775948]  ">
//                 Email:
//               </Text>
//               <Text
//                 style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
//                 className="text-[#66636D]  ">
//                 {u.email}
//               </Text>
//             </View>
//             <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
//               <Text
//                 style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
//                 className="text-[#775948]  ">
//                 Whatsapp:
//               </Text>
//               <Text
//                 style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
//                 className="text-[#66636D]  ">
//                 {u.phone}
//               </Text>
//             </View>
//             <View className="mb-9 flex-row justify-between align-middle items-center gap-4">
//               <Text
//                 style={[{fontSize: wp(5)}, styles.text, styles.shadow]}
//                 className="text-[#775948]  ">
//                 Mobile:
//               </Text>
//               <Text
//                 style={[{fontSize: wp(4)}, styles.text, styles.shadow]}
//                 className="text-[#66636D]  ">
//                 +422 481 222 32
//               </Text>
//             </View>
//           </View>
//         ))}
//         <TouchableOpacity
//           style={[styles.shadow]}
//           onPress={() => navigation.navigate('EditUser')}
//           className=" bg-gray-900 flex text-center top-10   px-2 py-1 rounded-md border-2 border-gray-900">
//           <Text
//             style={[{fontSize: wp(5)}]}
//             className="font-bold text-[#D9D9D9] font-serif px-[10%] text-center ">
//             Edit Profile
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </Layout>
//   );
// }

// const styles = StyleSheet.create({
//   text: {
//     fontFamily: 'Arial Rounded MT Bold',
//     // Make sure this matches the font's name
//   },
//   shadow: {
//     shadowColor: '#00000',
//     shadowOffset: {width: 4, height: 4},
//     shadowOpacity: 0.8,
//     shadowRadius: 7,
//     elevation: 8,
//   },
// });
