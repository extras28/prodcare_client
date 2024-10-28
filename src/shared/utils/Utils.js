// Util functions
import { sha256 } from 'js-sha256';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/vi';
import Global from './Global';
import AppResource from 'shared/constants/AppResource';
import ToastHelper from 'shared/helpers/ToastHelper';
import LanguageHelper from 'shared/helpers/LanguageHelper';
moment.locale('vi');

const Utils = {
  // sha256
  sha256: (text) => {
    return sha256(text);
  },

  // Check object empty
  isObjectEmpty: (obj) => {
    return Utils.isObjectNull(obj) || (Object.keys(obj).length === 0 && obj.constructor === Object);
  },

  // Get full url
  getFullUrl: (url, isAvatar = true) => {
    if (url && !url.startsWith('http') && !url.startsWith('blob')) {
      if (process.env.REACT_APP_ENVIRONMENT !== 'PROD') {
        return `${process.env.REACT_APP_BASE_URL}${encodeURI(url)}`;
      }

      return `http://${window.location.host}${encodeURI(url)}`;
    } else if (!url && isAvatar) {
      return AppResource.images.imgDefaultAvatar;
    }
    return encodeURI(url);
  },

  // Check is full url
  checkFullUrl: (url) => {
    if (url && url.startsWith('http')) {
      return true;
    }
    return false;
  },

  // Check object null|undefine
  isObjectNull: (obj) => {
    return obj === null || obj === undefined || obj === 'NULL';
  },

  // convert first character of string to uppercase
  convertFirstCharacterToUppercase: (stringToConvert) => {
    var firstCharacter = stringToConvert.substring(0, 1);
    var restString = stringToConvert.substring(1);
    return firstCharacter.toUpperCase() + restString;
  },

  // format number
  formatNumber: (iNumber) => {
    return new Intl.NumberFormat('de-DE').format(iNumber);
  },

  // format date time
  formatDateTime: (sDateTime, sFormat = 'DD/MM/YYYY HH:mm', utc = false) => {
    if (utc) {
      return moment(sDateTime).utc().format(sFormat);
    }
    return moment(sDateTime).local().format(sFormat);
  },

  // get time ago
  timeAgo: (sDateTime) => {
    const momentTime = moment.utc(sDateTime);
    return momentTime.fromNow();
  },

  // Change empty to null
  formatEmptyKey: (items) => {
    for (const [key, value] of Object.entries(items)) {
      if (value === '' || value === undefined) {
        items[key] = null;
      }
    }
  },

  // remove null key
  removeNullKey: (items) => {
    for (const [key, value] of Object.entries(items)) {
      if (_.isNull(value)) {
        delete items[key];
      }
    }
  },

  // Delete null
  formatNullKey: (items) => {
    for (const [key, value] of Object.entries(items)) {
      if (_.isNull(value)) {
        delete items[key];
      }
    }
  },

  /**
   *
   * @param {string} text Text can copy vao clipboard
   * @param {function} callback Callback khi hoan thanh copy
   */
  copyTextToClipboard: (text, callback) => {
    navigator.clipboard.writeText(text);
    if (_.isFunction(callback)) {
      callback();
    }
  },

  // check pagination
  getNextPage: (pagination) => {
    const { total, count, currentPage } = pagination;

    const hasMorePage = currentPage * Global.gDefaultPagination < total;
    if (hasMorePage) {
      return currentPage + 1;
    }

    return null;
  },

  // get current url
  getCurrentUrl: () => {
    return window.location.href;
  },

  // get last array item
  getLastItem: (items) => {
    if (items && Array.isArray(items) && items.length > 0) {
      return items[items.length - 1];
    }
    return null;
  },

  // scroll div to bottom
  scrollToBottom: (id) => {
    var div = document.getElementById(id);
    if (div) {
      div.scrollTop = div.scrollHeight - div.clientHeight;
    }
  },

  // Decode html
  decodeHTML: (html) => {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  },

  stripHtml: (html) => {
    let tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  // open link in new tab
  openInNewTab: (url) => {
    window.open(url, '_blank').focus();
  },

  // open link in current tab
  openInCurrentTab: (url) => {
    window.open(url);
  },

  /**
   * Convert file size to MB
   * @param {number} sizeInBytes File size in bytes
   * @returns
   */
  fileSizeInMB: (sizeInBytes) => {
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return sizeInMB;
  },

  blurColor: (colorCode, opacity) => {
    return `rgba(${parseInt(colorCode.slice(1, 3), 16)}, ${parseInt(
      colorCode.slice(3, 5),
      16
    )}, ${parseInt(colorCode.slice(5, 7), 16)}, ${opacity})`;
  },

  convertStringToNumber: (string) => {
    let cleanedString =
      typeof string === 'string'
        ? string.includes(',')
          ? string.replace(',', '')
          : string
        : string;
    return parseInt(cleanedString);
  },

  allElementsZero: (array) => {
    for (let element of array) {
      if (element !== 0) {
        return false;
      }
    }
    return true;
  },

  getBaseURL: () => {
    // let baseURL = `http://${window.location.host}`;

    // return baseURL;
    if (process.env.REACT_APP_ENVIRONMENT !== 'PROD') {
      return process.env.REACT_APP_BASE_URL;
    }
    return `http://${window.location.host}`;
  },

  getBaseApiUrl: () => {
    // let baseURL = process.env.REACT_APP_BASE_API_URL;
    if (process.env.REACT_APP_ENVIRONMENT !== 'PROD') {
      return process.env.REACT_APP_BASE_API_URL;
    }
    return `http://${window.location.host}/api/v1`;

    // return baseURL;
  },

  removeDuplicates: (arr) => {
    return [...new Set(arr)];
  },

  sortDate: (data) => {
    data.sort((a, b) => {
      const dateA = moment(a.time, 'YYYY-MM-DD');
      const dateB = moment(b.time, 'YYYY-MM-DD');
      return dateA - dateB;
    });

    return data;
  },

  splitUrls: (urlsString) => {
    if (urlsString === '') {
      return [];
    }
    return urlsString.split(',');
  },

  joinUrls: (urlsArray) => {
    if (urlsArray.length === 0) {
      return '';
    }
    return urlsArray.join(',');
  },

  b64EncodeUnicode: (str) => {
    return btoa(encodeURIComponent(str));
  },

  UnicodeDecodeB64: (str) => {
    return decodeURIComponent(atob(str));
  },

  // Chuyen tieng viet co dau -> khong dau
  /**
   *
   * @param {string} str Xau can bo dau
   * @returns {string} Xau da duoc bo dau
   */
  removeVietnameseTones: (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      ' '
    );

    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, ' ');

    // Bo cac ky tu non-alphanumeric
    str = str.replace(/[^A-Za-z0-9\/ ]/g, '');

    return str;
  },

  formatSeconds: (number) => {
    const minutes = Math.round(number / 60);
    const seconds = number % 60;
    return `${minutes < 10 ? `0${minutes}` : minutes} : ${seconds < 10 ? `0${seconds}` : seconds}`;
  },

  validateImageFile: (file) => {
    if (file) {
      const reader = new FileReader();
      const img = new Image();

      reader.onloadend = () => {
        img.onload = () => {
          const width = img.width;
          const sizeInMB = (file.size / 1048576).toFixed(2); // Convert bytes to megabytes

          // Use the width and size as required
          console.log('Image Width:', width);
          console.log('Image Size:', sizeInMB, 'MB');
          console.log('Image type:', file.type);
          if (
            width > 2000 ||
            sizeInMB > 1 ||
            (!file?.type?.includes('jpg') && !file?.type?.includes('jpeg'))
          ) {
            ToastHelper.showError(
              ' Ảnh chưa được tối ưu: Định dạng ảnh nên là JPG, kích thước tệp tin nên dưới 1MB, chiều rộng của ảnh <= 2000px.'
            );
          }
        };

        img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }
  },
  // get JSON data from string
  getJSONParse: (str, fieldName = '', showError = true) => {
    try {
      return str ? JSON.parse(str) : '';
    } catch (error) {
      if (showError) {
        ToastHelper.showError(`${fieldName} không đúng định dạng JSON`);
      }
      return '';
    }
  },
  // filter out empty elements
  filterEmptyObject: (arr) => {
    if (!_.isArray(arr) || arr.length === 0) {
      return arr;
    }
    return arr.filter(
      (e) => !!e && Object.values(e).length > 0 && Object.values(e).filter((e) => !!e).length > 0
    );
  },
  //  get new page breadcrumb schema from current schema and new path and title
  getPageBreadcrumbSchema: (currentSchema, newPath, title = '') => {
    if (!newPath) return currentSchema;
    const pathCopy = newPath?.split('/')?.filter((e) => !!e);
    if (!pathCopy && pathCopy.length === 0) {
      return currentSchema;
    }
    const followBreadcrumb = pathCopy?.map((path, index) => {
      return {
        '@type': 'ListItem',
        position: 2 + index,
        item: {
          '@id': `/${pathCopy.slice(0, index + 1).join('/')}`,
          name: index < pathCopy.length - 1 ? path || '' : title,
        },
      };
    });
    return {
      ...currentSchema,
      itemListElement: [currentSchema?.itemListElement[0], ...followBreadcrumb],
    };
  },
  // get new category breadscumb schema from current schema and new path and title
  getCategoryBreadcrumbSchema: (currentSchema, newPath, title = '') => {
    if (!newPath) return currentSchema;
    const pathCopy = newPath?.split('/')?.filter((e) => !!e);
    if (!pathCopy && pathCopy.length === 0) {
      return currentSchema;
    }
    const followBreadcrumb = pathCopy?.map((path, index) => {
      return {
        '@type': 'ListItem',
        position: 3 + index,
        item: {
          '@id': `/tin-tuc/${pathCopy.slice(0, index + 1).join('/')}`,
          name: index < pathCopy.length - 1 ? path || '' : title,
        },
      };
    });
    return {
      ...currentSchema,
      itemListElement: [
        currentSchema?.itemListElement[0],
        currentSchema?.itemListElement[1],
        ...followBreadcrumb,
      ],
    };
  },
  // get block string from JSON object
  getBlocksStringify: (blocks) => {
    const blocksCopy =
      blocks && Object.values(blocks).length > 0
        ? blocks
        : [
            {
              blockCode: '',
              position: '',
            },
          ];
    return JSON.stringify(blocksCopy, null, '\t');
  },
  // get other scripts string from scripts array
  getOtherScriptsStringify: (scripts) => {
    const otherScripts =
      scripts && _.isArray(scripts)
        ? Utils.filterEmptyObject(scripts)?.filter((script) => script?.name !== 'SchemaPage')
        : [];
    return otherScripts.length > 0 ? JSON.stringify(otherScripts, null, '\t') : '';
  },
  // get initial category breadcrumb schema string initial from breadcrumb field and path
  getCategoryBreadcrumbSchemaStringifyInitial: (breadcrumb, path, name = '') => {
    return breadcrumb
      ? typeof breadcrumb === 'object'
        ? JSON.stringify(breadcrumb, null, '\t')
        : breadcrumb
      : JSON.stringify(
          Utils.getCategoryBreadcrumbSchema(
            {
              '@context': 'http://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: { '@id': '/', name: 'Trang chủ' },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: { '@id': '/tin-tuc', name: 'Tin tức' },
                },
              ],
            },
            path,
            name
          ),
          null,
          '\t'
        );
  },

  // get STT
  getSTT: (index, page = 0, limit = 30) => {
    return (page ? page : 0) * (limit ? limit : 30) + index + 1;
  },

  number2String: (number) => {
    if (parseInt(number.toString()) < 999) {
      return number;
    }
    return number.toString().slice(0, 3) + '...';
  },

  hexToRGBA: (hex, alpha) => {
    // Remove '#' if it's included
    hex = hex.replace('#', '');

    // Parse hexadecimal color string to separate RGB values
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    // Convert alpha value to range between 0 and 1
    var a = alpha >= 0 ? parseFloat(alpha) : 1;
    // Return RGBA string
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
  },

  timeDiffFromNow: (timeString, language = 'vi') => {
    // Parse the given time string using moment
    const givenTime = moment(timeString);

    // Get the current time
    const currentTime = moment();

    // Calculate the difference in milliseconds
    const diffInMilliseconds = currentTime.diff(givenTime);

    // Convert the difference to a readable format
    const duration = moment.duration(diffInMilliseconds);

    // Calculate time differences
    const years = Math.floor(duration.asYears());
    const months = Math.floor(duration.asMonths());
    const weeks = Math.floor(duration.asWeeks());
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    // Define language options for output
    let result = '';

    if (language === 'vi') {
      if (years > 0) result = `${years} năm trước`;
      else if (months > 0) result = `${months} tháng trước`;
      else if (weeks > 0) result = `${weeks} tuần trước`;
      else if (days > 0) result = `${days} ngày trước`;
      else if (hours > 0) result = `${hours} giờ trước`;
      else if (minutes > 0) result = `${minutes} phút trước`;
      else result = `${seconds} giây trước`;
    } else if (language === 'en') {
      if (years > 0) result = `${years} years ago`;
      else if (months > 0) result = `${months} months ago`;
      else if (weeks > 0) result = `${weeks} weeks ago`;
      else if (days > 0) result = `${days} days ago`;
      else if (hours > 0) result = `${hours} hours ago`;
      else if (minutes > 0) result = `${minutes} minutes ago`;
      else result = `${seconds} seconds ago`;
    }

    return result;
  },

  formatTimeDifference: (
    timeDifferenceInSeconds,
    language = LanguageHelper.getCurrentLanguage()
  ) => {
    const timeUnits = {
      en: {
        second: 'second',
        minute: 'minute',
        hour: 'hour',
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year',
        ago: 'ago',
      },
      vi: {
        second: 'giây',
        minute: 'phút',
        hour: 'giờ',
        day: 'ngày',
        week: 'tuần',
        month: 'tháng',
        year: 'năm',
        ago: 'trước',
      },
    };

    const selectedLanguage = timeUnits[language];

    const timeIntervals = [
      { unit: 'year', seconds: 31536000 }, // 60 * 60 * 24 * 365
      { unit: 'month', seconds: 2592000 }, // 60 * 60 * 24 * 30
      { unit: 'week', seconds: 604800 }, // 60 * 60 * 24 * 7
      { unit: 'day', seconds: 86400 }, // 60 * 60 * 24
      { unit: 'hour', seconds: 3600 }, // 60 * 60
      { unit: 'minute', seconds: 60 }, // 60
      { unit: 'second', seconds: 1 },
    ];

    for (let interval of timeIntervals) {
      const timeValue = Math.floor(timeDifferenceInSeconds / interval.seconds);
      if (timeValue >= 1) {
        const unitLabel =
          selectedLanguage[interval.unit] + (timeValue > 1 && language === 'en' ? 's' : '');
        return `${timeValue} ${unitLabel} ${selectedLanguage.ago}`;
      }
    }

    // If the difference is less than 1 second
    return `0 ${selectedLanguage.second} ${selectedLanguage.ago}`;
  },
};

export default Utils;
