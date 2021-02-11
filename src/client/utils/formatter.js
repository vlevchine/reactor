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

const formatter = {};
const setFormats = ({ locale, uom = 'M' }) => {
  formatter.decimal = new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: numDecimal,
  });
  formatter.currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency[locale],
    currencyDisplay: 'symbol',
    maximumFractionDigits: numCurrency,
  });
  formatter.percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: numCurrency,
  });
  formatter.date = new Intl.DateTimeFormat(locale, dateOptions);
  formatter.uom = {
    format: (val) =>
      val
        ? `${formatter.decimal.format(
            val.toUnitSystem(uom)
          )} ${val.getLabel(uom)}`
        : '',
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
