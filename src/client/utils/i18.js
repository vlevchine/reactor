import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
//import EN_TEXT from '@root/assets/locale/translations.en.json';
//import ES_TEXT from '@root/assets/locale/translations.es.json';
var EN_TEXT = {};
i18n.use(LanguageDetector).init({
  resources: {
    en: { translations: EN_TEXT }, //    es: { translations: ES_TEXT },
  },
  fallbackLng: 'en',
  ns: ['translations'],
  defaultNS: 'translations',
  debug: true,
  interpolation: {
    escapeValue: false,
    format: function(value, format, lang = i18n.language) {
      if (format === 'AS_DATE') {
        try {
          const dd = new Date(value);
          return new Intl.DateTimeFormat(lang).format(
            new Date(dd.getTime() + dd.getTimezoneOffset() * 60000)
          );
        } catch (e) {
          return '???';
        }
      } else {
        return value;
      }
    },
  },
});
//request and add bundle
// i18n.addResourceBundle('en', 'namespace1', {
//   key: 'hello from namespace 1'
// });
const t = i18n.t.bind(i18n);
export default t;
