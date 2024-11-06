import moment from 'moment';
import PreferenceKeys from 'shared/constants/PreferenceKeys';

// Global variables
const Global = {
  gDefaultPagination: 30,

  gNeedToRefreshUserList: false,
  gFiltersUserList: { page: 0, limit: 30, q: '' },

  gNeedToRefreshCustomerList: false,
  gFiltersCustomerList: { page: 0, limit: 30, q: '' },

  gNeedToRefreshProjectList: false,
  gFiltersProjectList: { page: 0, limit: 30, q: '' },

  gNeedToRefreshComponentList: false,
  gFiltersComponentList: {
    page: 0,
    limit: 30,
    q: '',
    productId: '',
    level: '',
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id ?? '',
  },

  gNeedToRefreshEventList: false,
  gFiltersEventList: {
    // page: 0,
    // limit: 30,
    q: '',
    productId: '',
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id ?? '',
    componentId: '',
  },

  gNeedToRefreshProductList: false,
  gFiltersProductList: {
    page: 0,
    limit: 30,
    q: '',
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
    type: '',
  },

  gNeedToRefreshIssueList: false,
  gFiltersIssueList: {
    page: 0,
    limit: 30,
    q: '',
    status: '',
    errorType: '',
    level: '',
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  },

  gNeedToRefreshStatisticByYear: false,
  gFiltersStatisticByYear: {
    year: moment().year(),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  },

  gNeedToRefreshStatisticByQuarter: false,
  gFiltersStatisticByQuarter: {
    year: moment().format('YYYY'),
    quarter: moment().quarter().toString(),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  },

  gNeedToRefreshStatisticByMonth: false,
  gFiltersStatisticByMonth: {
    month: moment().format('YYYY-MM'),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  },

  gNeedToRefreshStatisticByWeek: false,
  gFiltersStatisticByWeek: {
    week: moment().format('YYYY-Www'),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  },
};

export default Global;
