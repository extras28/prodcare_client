import { removeAxiosAccessToken } from 'api/axiosClient';
import moment from 'moment';
import AppResource from 'shared/constants/AppResource';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Utils from 'shared/utils/Utils';

const AccountHelper = {
  getAccessToken: () => {
    return localStorage.getItem(PreferenceKeys.accessToken);
  },

  // kiem tra access token hop le
  checkAccessTokenValid: () => {
    const accessToken = AccountHelper.getAccessToken();
    const accessTokenExpireDate = AccountHelper.getAccessTokenExpireDate();
    if (accessToken && accessTokenExpireDate) {
      const momentNow = moment();
      const momentExpired = moment(accessTokenExpireDate);
      return momentExpired.isAfter(momentNow);
    }

    return false;
  },

  getAccessTokenExpireDate: () => {
    return localStorage.getItem(PreferenceKeys.accessTokenExpired);
  },

  signOut: () => {
    localStorage.removeItem(PreferenceKeys.accessToken);
    localStorage.removeItem(PreferenceKeys.accessTokenExpired);
    localStorage.removeItem(PreferenceKeys.currentProject);
    removeAxiosAccessToken();
  },
  // Get display name
  getDisplayName: (user) => {
    if (user && user.displayName && user.displayName !== 'null') {
      return user.displayName;
    }
    return user?.name;
  },

  // Get display name and phone
  getDisplayNameAndPhone: (user) => {
    let displayName = '';
    if (user) {
      displayName = user.fullname ?? user.username;

      if (user.phone) {
        displayName = displayName.concat(` - ${user.phone}`);
      }
    }
    return displayName;
  },
  getAccountAvatar: (account) => {
    const avatar = account?.avatar;
    if (avatar) {
      return Utils.getFullUrl(avatar);
    } else {
      return AppResource.images.imgDefaultAvatar;
    }
  },
};

export default AccountHelper;
