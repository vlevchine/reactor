const numStyles = { currency: 'currency', percent: 'percent' },
  numStyle = (type) => numStyles[type] || 'decimal',
  fractional = (num = 2, type) =>
    type === 'currency' ? Math.min(2, num) : num;

export const numberFormatter = (locale, type) =>
  new Intl.NumberFormat(locale, {
    style: numStyle(type), //currrency, percent, or decimal
    maximumFractionDigits: fractional(3),
    currency: 'USD', //???
    currencyDisplay: 'symbol',
  });
