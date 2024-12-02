import AppResource from './AppResource';

const AppData = {
  // regex
  regexSamples: {
    phoneRegex:
      /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
    urlRegex:
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
  },

  // phan trang
  perPageItems: [
    { value: 5 },
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 50 },
    { value: 100 },
  ],

  // ngon ngu
  languages: [
    {
      icon: AppResource.icons.icFlagUs,
      title: 'English',
      code: 'en',
    },
    {
      icon: AppResource.icons.icFlagVi,
      title: 'Tiếng Việt',
      code: 'vi',
    },
  ],

  // languages
  languageItems: [
    { name: 'English', value: 'en', icon: AppResource.icons.icFlagUs },
    { name: 'Tiếng Việt', value: 'vi', icon: AppResource.icons.icFlagVi },
  ],

  userRole: [
    { name: 'Admin', value: 'ADMIN' },
    { name: 'Operator', value: 'OPERATOR' },
    { name: 'User', value: 'USER' },
    { name: 'Guest', value: 'GUEST' },
  ],

  componentType: [
    { name: 'Software', value: 'SOFTWARE' },
    { name: 'Hardware', value: 'HARDWARE' },
  ],

  componentLevel: [
    { name: 'Level1', value: '1' },
    { name: 'Level2', value: '2' },
    { name: 'Level3', value: '3' },
  ],

  responsibleType: [
    { name: 'ErrorCauseByUser', value: 'USER' },
    { name: 'ErrorCauseByEnviroment', value: 'ENVIROMENT' },
    { name: 'ErrorCauseByDesign', value: 'DESIGN' },
    { name: 'ErrorCauseByManufaturing', value: 'MANUFACTURING' },
    { name: 'ErrorCauseByMaterial', value: 'MATERIAL' },
    { name: 'Unknown', value: 'UNKNOWN' },
  ],

  errorRemainStatus: [
    { name: 'Done', value: 'DONE', status: 'PROCESSED' },
    { name: 'Remain', value: 'REMAIN', status: 'UNPROCESSED' },
  ],

  errorUnhandleReason: [
    { name: 'OverWarranty', value: 'OVER_WARRANTY' },
    { name: 'PlanNotFinalized', value: 'PLAN_NOT_FINALIZED' },
    { name: 'WarrantyNotPurchased', value: 'WARRANTY_NOT_PURCHASED' },
    { name: 'WarehouseProceduresNotComleted', value: 'WAREHOUSE_PROCEDURES_NOT_COMPLETED' },
    { name: 'NoReplacementPersonAssigned', value: 'NO_REPLACEMENT_PERSON_ASSIGNED' },
  ],

  errorStatus: [
    {
      name: 'Unprocessed',
      value: 'UNPROCESSED',
      bgColor: '#FFA800',
      color: '#FFFFFF',
      selectedColor: '#FFFFFF',
      remainStatus: 'REMAIN',
    },
    {
      name: 'Processed',
      value: 'PROCESSED',
      bgColor: '#1BC5BD',
      color: '#FFFFFF',
      selectedColor: '#FFFFFF',
      remainStatus: 'DONE',
    },
    {
      name: 'Processing',
      value: 'PROCESSING',
      bgColor: '#3699ff',
      color: '#FFFFFF',
      selectedColor: '#FFFFFF',
      remainStatus: 'REMAIN',
    },
  ],

  errorLevel: [
    {
      name: 'Critical',
      value: 'CRITICAL',
      bgColor: '#FF4C4C',
      color: '#FFFFFF',
      selectedColor: '#FFFFFF',
      score: '4',
    },
    {
      name: 'Major',
      value: 'MAJOR',
      bgColor: '#FF7043',
      color: '#FFFFFF',
      selectedColor: '#FFFFFF',
      score: '3',
    },
    {
      name: 'Moderate',
      value: 'MODERATE',
      bgColor: '#FFD54F',
      color: '#3F4254',
      selectedColor: '#3F4254',
      score: '2',
    },
    {
      name: 'Minor',
      value: 'MINOR',
      bgColor: '#A5D6A7',
      color: '#FFFFFF',
      selectedColor: '#FFFFFF',
      score: '1',
    },
  ],

  scopeOfImpacts: [
    { name: 'ScopeOfAffectedUnits', value: 'UNIT' },
    { name: 'ScopeOfServiceProvisionForCustomers', value: 'SERVICE_DELIVERY' },
    { name: 'ImportanceLevelOfAffectedUnit', value: 'IMPORTANCE_OF_UNIT' },
    { name: 'OperationalLevelAndProductFeatures', value: 'PRODUCT_FUNCTIONALITY' },
    { name: 'UserSafety', value: 'USER_SAFETY' },
    { name: 'ProductSecurity', value: 'PRODUCT_SECURITY' },
    { name: 'ProductAvailability', value: 'PRODUCT_AVAILABILITY' },
    { name: 'ViettelReputationAndBrand', value: 'VIETTEL_REPUTATION' },
  ],

  impactPoints: [
    { name: '4', value: '4' },
    { name: '3', value: '3' },
    { name: '2', value: '2' },
    { name: '1', value: '1' },
  ],

  urgencyPoints: [
    { name: '3', value: '3' },
    { name: '2', value: '2' },
    { name: '1', value: '1' },
  ],

  urgencyLevels: [
    { name: 'High', value: 'HIGH', score: '3' },
    { name: 'Medium', value: 'MEDIUM', score: '2' },
    { name: 'Low', value: 'LOW', score: '1' },
  ],

  overdueKpiReasons: [
    { name: 'NoErrorRecoveryPlan', value: 'NO_ERROR_RECOVERY_PLAN' },
    { name: 'DelayedDeviceReturn', value: 'DELAYED_DEVICE_RETURN' },
    { name: 'BadWeather', value: 'BAD_WEATHER' },
    {
      name: 'NoRepairDueToWarrantyExpiry',
      value: 'NO_REPAIR_DUE_TO_WARRANTY_EXPIRY',
    },
    { name: 'NoRecoveryPlanAvailable', value: 'NO_RECOVERY_PLAN_AVAILABLE' },
    { name: 'TTRDNoSolution', value: 'TTRD_NO_SOLUTION' },
  ],

  handlingMeasures: [
    { name: 'ReplaceDevice', value: 'REPLACE_DEVICE' },
    { name: 'Repair', value: 'REPAIR' },
    { name: 'ReplaceOrRepair', value: 'REPLACE_OR_REPAIR' },
    { name: 'Preserve', value: 'PRESERVE' },
    { name: 'Calibrate', value: 'CALIBRATE' },
    { name: 'UpdateFwSw', value: 'UPDATE_FW_SW' },
    { name: 'UpdateXLTTSoftware', value: 'UPDATE_XLTT_SOFTWARE' },
    { name: 'UpdateXLTHSoftware', value: 'UPDATE_XLTH_SOFTWARE' },
    { name: 'ReSolderHighFrequencyCable', value: 'RE_SOLDER_HIGH_FREQUENCY_CABLE' },
    { name: 'CheckSystemAgain', value: 'CHECK_SYSTEM_AGAIN' },
  ],

  productStatus: [
    { name: 'Delivered', value: 'DELIVERED' },
    { name: 'Accepted', value: 'ACCEPTED' },
    { name: 'IntegrationCompleted', value: 'INTEGRATION_COMPLETED' },
    { name: 'MeasurementCompleted', value: 'MEASUREMENT_COMPLETED' },
    { name: 'GoodsShippedNotIntegrated', value: 'GOODS_SHIPPED_NOT_INTEGRATED' },
    { name: 'InTesting', value: 'IN_TESTING' },
  ],

  quarters: [
    { name: '1', value: '1' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
    { name: '4', value: '4' },
  ],

  productCurrentStatus: [
    { name: 'Using', value: 'USING' },
    { name: 'Stored', value: 'STORED' },
  ],
};

export default AppData;
