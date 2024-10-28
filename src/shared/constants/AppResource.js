import icFlagEn from 'assets/images/flags/ic_flag_en.svg';
import icFlagUs from 'assets/images/flags/ic_flag_us.svg';
import icFlagVi from 'assets/images/flags/ic_flag_vi.svg';
import keenIcNavigationUp from 'assets/icons/Keens/Navigation/Up-2.svg';
import keenIcUser from 'assets/icons/Keens/General/User.svg';
import keenIcToggleRight from 'assets/icons/Keens/Text/Toggle-Right.svg';
import icEmptyState from 'assets/icons/prodcare/icon_empty.png';

const AppResource = {
  icons: {
    icFlagEn,
    icFlagUs,
    icFlagVi,
    icEmptyState,
    keens: {
      up: keenIcNavigationUp,
      user: keenIcUser,
      toggleRight: keenIcToggleRight,
    },
  },

  images: {
    // keens
    keens: {
      bg1: require('assets/images/Keens/bg1.jpg'),
      bg2: require('assets/images/Keens/bg2.jpg'),
      bg3: require('assets/images/Keens/bg3.jpg'),
    },

    imgDefaultAvatar: require('assets/images/prodcare/img_default_avatar.jpg'),
    imgLogo: require('assets/images/prodcare/img_logo.png'),
    imgSignInBG: require('assets/images/prodcare/img_sign_in_bg.jpg'),
    imgPageUnderConstruction: require('assets/images/prodcare/img_page_under_construction.png'),
  },
  colors: {
    feature: '#ee0434',
    darkGrey: '#262224',
    grey: '#5A5C6F',
    grey50: '#ACACBB',
    lightGreyStroke: '#E0E2ED',
    lineIndicator: '#E8EFF4',
    lightGrey50: '#F1F5F8',
    white: '#ffffff',
    featureBlue: '#0066C7',
    featureYellow: '#FF9427',
    featureGreen: '#18CDBD',
    red: '#CD1F13',
  },
};

export default AppResource;
