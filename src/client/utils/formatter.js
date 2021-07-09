import { _ } from '@app/helpers';

const numCurrency = 2,
  numDecimal = 3,
  dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  currency = {
    'en-CA': 'CAD',
    'en-US': 'USD',
    'de-DE': 'EUR',
  };

let formatter = {};
const d_config = { locale: 'en-CA', uom: 'M' },
  formats = {};
const setFormats = (conf) => {
  const { locale, uom } = Object.assign({}, d_config, conf);
  formats.decimal = new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: numDecimal,
  });
  formats.currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency[locale],
    currencyDisplay: 'symbol',
    maximumFractionDigits: numCurrency,
  });
  formats.percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: numCurrency,
  });
  formats.date = new Intl.DateTimeFormat(locale, dateOptions);
  formats.uom = {
    format: (val) =>
      [
        formats.decimal.format(val.toUnitSystem(uom)),
        val.getLabel(uom),
      ].join(' '),
  };

  formatter = Object.keys(formats).reduce((acc, k) => {
    acc[k] = {
      format: (val) => (_.isNil(val) ? '' : formats[k].format(val)),
    };
    return acc;
  }, {});
  formatter.date = {
    format: (val) =>
      _.isNil(val) ? '' : formats.date.format(new Date(val)),
  };
};

export { setFormats, formatter };
const appParams = {
  locale: [
    { id: 'en-CA', value: 'en-CA', label: 'English-CA' },
    { id: 'en-US', value: 'en-US', label: 'English-USA' },
    { id: 'de-DE', value: 'de-DE', label: 'German' },
  ],
  uom: [
    { id: 'M', value: 'M', label: 'Metric' },
    { id: 'I', value: 'I', label: 'Imperial' },
  ],
};
export default appParams;
