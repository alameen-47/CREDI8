import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {useSearch} from '../context/search.js';
import {AuthContext} from '../context/auth.js';
import debounce from 'lodash.debounce';

export default function Header() {
  const navigation = useNavigation();
  const {removeAuthData} = useContext(AuthContext);
  const {query, results, loading, handleSearch} = useSearch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Measured layout of the search bar — used to position the search dropdown Modal
  const [searchBarLayout, setSearchBarLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Measured layout of the hamburger icon — used to position the profile menu Modal
  const [menuIconLayout, setMenuIconLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const searchWrapperRef = useRef(null);
  const menuWrapperRef = useRef(null);

  // Sync local input with external query resets (e.g. after selection)
  useEffect(() => {
    setInputValue(query ?? '');
  }, [query]);

  const debouncedSearch = useRef(
    debounce(text => handleSearch(text), 500),
  ).current;

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleInputChange = text => {
    setInputValue(text);
    debouncedSearch(text);
  };

  const clearSearch = () => {
    debouncedSearch.cancel();
    setInputValue('');
    handleSearch('');
  };

  const handleSelectedCustomer = item => {
    clearSearch();
    navigation.navigate('EditCustomer', {customer: item});
  };

  const navigateTo = screen => {
    setIsMenuOpen(false);
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await removeAuthData();
    navigation.navigate('LogIn');
  };

  const showDropdown = inputValue.length > 0;

  /*
   * Measure the search wrapper's absolute position on screen.
   * Called on layout so coordinates are always fresh.
   */
  const onSearchWrapperLayout = () => {
    if (searchWrapperRef.current) {
      searchWrapperRef.current.measureInWindow((x, y, width, height) => {
        setSearchBarLayout({x, y, width, height});
      });
    }
  };

  /*
   * Measure the menu icon's absolute position on screen.
   */
  const onMenuWrapperLayout = () => {
    if (menuWrapperRef.current) {
      menuWrapperRef.current.measureInWindow((x, y, width, height) => {
        setMenuIconLayout({x, y, width, height});
      });
    }
  };

  return (
    <View style={styles.root}>
      <Image
        style={styles.logo}
        source={require('../assets/icons/Logo-small.png')}
        resizeMode="contain"
      />

      {/* ── Search bar ── */}
      <View
        ref={searchWrapperRef}
        style={styles.searchWrapper}
        onLayout={onSearchWrapperLayout}>
        <View style={[styles.searchBar, showDropdown && styles.searchBarOpen]}>
          <Image
            style={styles.searchIcon}
            source={require('../assets/icons/search.png')}
            resizeMode="contain"
          />

          <TextInput
            style={styles.searchInput}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="Search customer…"
            placeholderTextColor="#8A9099"
            returnKeyType="search"
          />

          {/* FIX: spinner color matches theme; hidden when not loading */}
          {loading && (
            <ActivityIndicator
              size="small"
              color="#F4F1D6"
              style={styles.spinner}
            />
          )}

          {/* FIX: clear button — only shown when there is text */}
          {inputValue.length > 0 && !loading && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Search Dropdown Modal ── */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={clearSearch}>
        <Pressable style={StyleSheet.absoluteFill} onPress={clearSearch} />

        <View
          style={[
            styles.dropdown,
            {
              top: searchBarLayout.y + searchBarLayout.height,
              left: searchBarLayout.x,
              width: searchBarLayout.width,
            },
          ]}>
          {results?.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={item => item._id}
              keyboardShouldPersistTaps="handled"
              style={styles.dropdownList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  activeOpacity={0.7}
                  onPress={() => handleSelectedCustomer(item)}>
                  <Text style={styles.dropdownName}>{item.custName}</Text>
                  <Text style={styles.dropdownNumber}>{item.custNumber}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No customers found</Text>
              </View>
            )
          )}
        </View>
      </Modal>

      {/* ── Hamburgerw   / Profile menu ── */}
      <View
        ref={menuWrapperRef}
        style={styles.menuWrapper}
        onLayout={onMenuWrapperLayout}>
        {!isMenuOpen ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMenuOpen(true)}>
            <Image
              style={styles.hamburger}
              source={require('../assets/icons/Hamburger-Menu.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMenuOpen(false)}>
            <Image
              style={styles.closeIcon}
              source={require('../assets/icons/X-icon.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Profile Menu Modal ── */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsMenuOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setIsMenuOpen(false)}
        />

        <View
          style={[
            styles.profileMenu,
            {
              top: menuIconLayout.y + menuIconLayout.height + hp(1),
              left: menuIconLayout.x + menuIconLayout.width - wp(45),
            },
          ]}>
          <ProfileMenuItem
            icon={require('../assets/icons/User.png')}
            label="User Profile"
            onPress={() => navigateTo('UserDetails')}
          />
          <View style={styles.menuDivider} />
          <ProfileMenuItem
            icon={require('../assets/icons/adminEdit.png')}
            label="Edit Profile"
            onPress={() => navigateTo('EditUser')}
          />
          <View style={styles.menuDivider} />
          <ProfileMenuItem
            icon={require('../assets/icons/Logout.png')}
            label="Logout"
            onPress={handleLogout}
            isDestructive
          />
        </View>
      </Modal>
    </View>
  );
}

/* ─────────────────────────────────────────
   PROFILE MENU ITEM
───────────────────────────────────────── */
const ProfileMenuItem = ({icon, label, onPress, isDestructive = false}) => (
  <TouchableOpacity
    style={styles.profileItem}
    activeOpacity={0.6}
    onPress={onPress}>
    <Image style={styles.profileItemIcon} source={icon} resizeMode="contain" />
    <Text
      style={[
        styles.profileItemLabel,
        isDestructive && styles.profileItemLabelDestructive,
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const styles = StyleSheet.create({
  /* ── Root header bar ── */
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151E25',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    zIndex: 30,
    gap: wp(3),
    // subtle bottom border for separation
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },

  logo: {
    width: wp(13),
    height: wp(12),
  },

  /* ── Search ── */
  searchWrapper: {
    flex: 1,
    position: 'relative', // anchor for dropdown
    zIndex: 20,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#243038',
    borderRadius: wp(5),
    paddingHorizontal: wp(3),
    height: hp(5.5),
    // FIX: border so open state is obvious
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // FIX: visual feedback when dropdown is visible
  searchBarOpen: {
    borderColor: 'rgba(244,241,214,0.25)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  searchIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(2),
    tintColor: '#8A9099',
  },

  searchInput: {
    flex: 1,
    color: '#F4F1D6',
    fontSize: wp(3.5),
    padding: 0, // remove default Android padding
  },

  spinner: {
    marginLeft: wp(2),
  },

  clearBtn: {
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
  },

  clearBtnText: {
    color: '#8A9099',
    fontSize: wp(3.2),
  },

  /* ── Search dropdown ── */
  dropdown: {
    position: 'absolute',
    top: hp(5.5), // flush below search bar
    left: 0,
    right: 0,
    backgroundColor: '#1A262F',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(244,241,214,0.25)',
    borderBottomLeftRadius: wp(3),
    borderBottomRightRadius: wp(3),
    overflow: 'hidden',
    // shadow for depth
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },

  dropdownList: {
    maxHeight: hp(35), // FIX: capped — never pushes content off screen
  },

  dropdownItem: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
  },

  dropdownName: {
    color: '#F4F1D6',
    fontSize: wp(3.8),
    fontWeight: '600',
  },

  dropdownNumber: {
    color: '#8A9099',
    fontSize: wp(3.2),
    marginTop: 2,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: wp(4),
  },

  emptyState: {
    paddingVertical: hp(2.5),
    alignItems: 'center',
  },

  emptyStateText: {
    color: '#8A9099',
    fontSize: wp(3.5),
  },

  /* ── Hamburger / Profile menu ── */
  menuWrapper: {
    position: 'relative',
    zIndex: 40,
  },

  hamburger: {
    width: wp(8),
    height: wp(8),
  },

  closeIcon: {
    width: wp(5.5),
    height: wp(5.5),
  },

  profileMenu: {
    position: 'absolute',
    top: wp(9), // just below the close icon
    right: 0, // FIX: aligned to icon, no magic pixel offsets
    width: wp(45),
    backgroundColor: '#1A262F',
    borderRadius: wp(3),
    borderTopRightRadius: 0, // connects visually to the icon
    paddingVertical: hp(1),
    // shadow
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    gap: wp(3),
  },

  profileItemIcon: {
    width: wp(5.5),
    height: wp(5.5),
    tintColor: '#C8C5A8',
  },

  profileItemLabel: {
    color: '#F4F1D6',
    fontSize: wp(3.8),
    fontWeight: '600',
    fontFamily: 'serif',
  },

  profileItemLabelDestructive: {
    color: '#E05C5C',
  },

  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: wp(4),
  },
});
