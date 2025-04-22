// Утилиты для сайта
export function toNum(str) {
  return Number(str.replace(/ /g, ""));
}

export function toCurrency(num) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(num);
}
