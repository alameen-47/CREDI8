import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Pressable,
  StyleSheet,
} from 'react-native';
import React, {useContext, useRef, useState} from 'react';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../context/auth';

/* ─────────────────────────────────────────
   STATIC ICON MAP
───────────────────────────────────────── */
const ICONS = {
  billing: require('../assets/icons/billing.png'),
  addUser: require('../assets/icons/addUser.png'),
  editUser: require('../assets/icons/editUser.png'),
  allCustomers: require('../assets/icons/allCustomers.png'),
  editMessage: require('../assets/icons/editMessage.png'),
  logout: require('../assets/icons/Logout.png'),
};

/* ─────────────────────────────────────────
   LAYOUT CONSTANTS  (responsive)
───────────────────────────────────────── */
const RAIL_WIDTH = wp(18); // collapsed icon rail
const PANEL_WIDTH = wp(58); // sliding panel

/* ─────────────────────────────────────────
   MENU DATA
───────────────────────────────────────── */
const SUBSCRIPTION_ITEMS = [
  {label: 'Home', screen: 'HomeScreen'},
  {label: 'Usage', screen: 'Dashboard'},
  {label: 'Billing', screen: 'Billing'},
  {label: 'API Keys', screen: 'Integrations'},
  {label: 'Privacy', screen: 'Privacy'},
];

const CUSTOMER_ITEMS = [
  {label: 'Add Customer', screen: 'AddCustomer'},
  {label: 'Edit Customer', screen: 'AllCustomers'},
  {label: 'All Customers', screen: 'AllCustomers'},
  {label: 'Edit Message', screen: 'EditMessage'},
];

/*
 * Each rail icon maps to:
 *   menu  → which panel section to highlight
 *   screen → direct navigation target (optional shortcut)
 */
const RAIL_ICONS = [
  {
    key: 'addUser',
    icon: ICONS.addUser,
    menu: 'customer',
    screen: 'AddCustomer',
  },
  {
    key: 'editUser',
    icon: ICONS.editUser,
    menu: 'customer',
    screen: 'AllCustomers',
  },
  {
    key: 'allCustomers',
    icon: ICONS.allCustomers,
    menu: 'customer',
    screen: 'AllCustomers',
  },
  {
    key: 'editMessage',
    icon: ICONS.editMessage,
    menu: 'customer',
    screen: 'EditMessage',
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function SideBar() {
  const navigation = useNavigation();
  const {removeAuthData} = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('customer');
  const [activeIcon, setActiveIcon] = useState(null); // FIX: track highlighted rail icon

  /*
   * FIX: initial value is -PANEL_WIDTH (responsive, not hardcoded -300).
   * The panel lives to the RIGHT of the rail (left: RAIL_WIDTH),
   * so we only need to slide it by its own width, not the full screen.
   */
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  /* ── open / close helpers ── */
  const openPanel = (menuType, iconKey = null) => {
    setActiveMenu(menuType);
    setActiveIcon(iconKey);
    setIsOpen(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: -PANEL_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      setActiveIcon(null);
    });
  };

  /* Toggle: tapping the same section again closes the panel */
  const togglePanel = (menuType, iconKey) => {
    if (isOpen && activeMenu === menuType) {
      closePanel();
    } else {
      openPanel(menuType, iconKey);
    }
  };

  const goTo = screen => {
    closePanel();
    navigation.navigate(screen);
  };

  /* FIX: logout handler – never opens any panel */
  const handleLogout = async () => {
    if (isOpen) closePanel();
    await removeAuthData();
  };

  /* ── render ── */
  return (
    <View style={styles.root}>
      {/* ════════════════════════════════
          COLLAPSED ICON RAIL
      ════════════════════════════════ */}
      <View style={styles.rail}>
        {/* TOP – Subscription */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => togglePanel('subscription', 'billing')}
          style={[
            styles.railBtn,
            activeIcon === 'billing' && styles.railBtnActive,
          ]}>
          <Image style={styles.railIcon} source={ICONS.billing} />
        </TouchableOpacity>

        {/* MIDDLE – Customer icons, each mapped to its own screen */}
        <View style={styles.railMiddle}>
          {RAIL_ICONS.map(item => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              /*
               * FIX: single-tap navigates directly.
               * Long-press opens the panel with that section highlighted.
               * Remove onLongPress if you prefer single-tap → panel.
               */
              onPress={() => goTo(item.screen)}
              onLongPress={() => togglePanel(item.menu, item.key)}
              style={[
                styles.railBtn,
                activeIcon === item.key && styles.railBtnActive,
              ]}>
              <Image style={styles.railIcon} source={item.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTTOM – Logout (FIX: triggers logout directly, NOT openPanel) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.railBtn}>
          <Image style={styles.railIcon} source={ICONS.logout} />
        </TouchableOpacity>
      </View>

      {/* ════════════════════════════════
          OVERLAY (behind panel, over content)
          FIX: width starts after rail so
          tapping rail icons still works
      ════════════════════════════════ */}
      {isOpen && (
        <Pressable
          onPress={closePanel}
          style={[styles.overlay, {left: RAIL_WIDTH}]}
        />
      )}

      {/* ════════════════════════════════
          SLIDING PANEL
          FIX: left = RAIL_WIDTH so it
          opens BESIDE the rail, not over it.
          FIX: translateX starts at -PANEL_WIDTH
          (responsive, not hardcoded -300 px).
      ════════════════════════════════ */}
      <Animated.View
        style={[styles.panel, {transform: [{translateX: slideAnim}]}]}>
        {/* Panel header */}
        <View style={styles.panelHeader}>
          <View style={styles.panelAccent} />
          <Text style={styles.panelTitle}>
            {activeMenu === 'subscription' ? 'SUBSCRIPTION' : 'CUSTOMER'}
          </Text>
        </View>

        {/* Menu items */}
        <View style={styles.menuList}>
          {(activeMenu === 'subscription'
            ? SUBSCRIPTION_ITEMS
            : CUSTOMER_ITEMS
          ).map((item, idx) => (
            <MenuItem
              key={idx}
              label={item.label}
              onPress={() => goTo(item.screen)}
            />
          ))}
        </View>

        {/* FIX: Logout visually separated at the bottom of the panel */}
        {/* <View style={styles.panelLogout}>
          <View style={styles.divider} />
          <MenuItem label="Logout" onPress={handleLogout} isDestructive />
        </View> */}
      </Animated.View>
    </View>
  );
}

/* ─────────────────────────────────────────
   MENU ITEM
───────────────────────────────────────── */
const MenuItem = ({label, onPress, isDestructive = false}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    style={styles.menuItem}>
    <Text
      style={[styles.menuLabel, isDestructive && styles.menuLabelDestructive]}>
      {label}
    </Text>
    {/* Subtle animated underline indicator */}
    <View
      style={[
        styles.menuUnderline,
        isDestructive && {backgroundColor: '#E05C5C'},
      ]}
    />
  </TouchableOpacity>
);

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* ── Rail ── */
  rail: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: RAIL_WIDTH,
    height: '100%',
    backgroundColor: '#151E25',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
    zIndex: 1000, // above panel & overlay
    // subtle right border
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
  },

  railBtn: {
    width: wp(12),
    height: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(2),
  },

  /* FIX: active state on rail icon */
  railBtnActive: {
    backgroundColor: 'rgba(244, 241, 214, 0.12)',
  },

  railIcon: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },

  railMiddle: {
    gap: wp(12),
    alignItems: 'center',
  },

  /* ── Overlay ── */
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 998,
  },

  /* ── Sliding Panel ── */
  panel: {
    position: 'absolute',
    left: RAIL_WIDTH, // FIX: starts where the rail ends
    top: 0,
    width: PANEL_WIDTH,
    height: '100%',
    backgroundColor: '#1A232C', // slightly lighter than rail for depth
    paddingTop: '18%',
    paddingHorizontal: wp(5),
    paddingBottom: 40,
    zIndex: 999,
    // edge shadow for depth
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    marginBottom: wp(7),
  },

  panelAccent: {
    width: 3,
    height: wp(5),
    backgroundColor: '#F4F1D6',
    borderRadius: 2,
  },

  panelTitle: {
    color: '#F4F1D6',
    fontSize: wp(4),
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  menuList: {
    gap: wp(1),
    flex: 1,
  },

  menuItem: {
    paddingVertical: wp(3),
  },

  menuLabel: {
    color: '#C8C5A8',
    fontSize: wp(4),
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  menuLabelDestructive: {
    color: '#E05C5C',
  },

  menuUnderline: {
    marginTop: 4,
    height: 1,
    width: wp(8),
    backgroundColor: 'rgba(244,241,214,0.2)',
    borderRadius: 1,
  },

  /* FIX: logout pinned to bottom of panel with separator */
  panelLogout: {
    paddingBottom: wp(4),
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: wp(4),
  },
});
