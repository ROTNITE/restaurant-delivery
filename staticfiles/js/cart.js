// static/js/cart.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('cart.js loaded');

  // Утилиты
  function toNum(str) {
    return Number(str.replace(/\s/g, ''));
  }
  function toCurrency(num) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(num);
  }

  // Класс товара
  class Product {
    constructor(card) {
      this.imageSrc     = card.querySelector('.card__image img')?.src || '';
      this.name         = card.querySelector('.card__title')?.innerText || '';
      this.price        = card.querySelector('.card__price--common')?.innerText || '0';
      this.priceDiscount= card.querySelector('.card__price--discount')?.innerText || this.price;
    }
  }

  // Класс корзины
  class Cart {
    constructor() {
      this.products = [];
    }
    get count() {
      return this.products.length;
    }
    addProduct(p) {
      this.products.push(p);
    }
    removeProduct(index) {
      this.products.splice(index, 1);
    }
    get cost() {
      return this.products.reduce((sum, p) => sum + toNum(p.price), 0);
    }
    get costDiscount() {
      return this.products.reduce((sum, p) => sum + toNum(p.priceDiscount), 0);
    }
    get discount() {
      return this.cost - this.costDiscount;
    }
  }

  // DOM-элементы
  const cardAddArr   = Array.from(document.querySelectorAll('.card__add'));
  const cartBtn      = document.getElementById('cart');
  const cartNumEl    = document.getElementById('cart_num');
  const popup        = document.querySelector('.popup');
  const popupClose   = document.getElementById('popup_close');
  const body         = document.body;
  const popupList    = document.getElementById('popup_product_list');
  const popupCost    = document.getElementById('popup_cost');
  const popupDisc    = document.getElementById('popup_discount');
  const popupCostD   = document.getElementById('popup_cost_discount');

  // Инициализация корзины
  const myCart = new Cart();
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify(myCart));
  } else {
    const saved = JSON.parse(localStorage.getItem('cart'));
    myCart.products = saved.products || [];
  }
  cartNumEl.textContent = myCart.count;

  // Открытие/закрытие попапа
  cartBtn.addEventListener('click', e => {
    e.preventDefault();
    fillPopup();
    popup.classList.add('popup--open');
    body.classList.add('lock');
  });
  popupClose.addEventListener('click', e => {
    e.preventDefault();
    popup.classList.remove('popup--open');
    body.classList.remove('lock');
  });

  // Добавление товара
  cardAddArr.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card = btn.closest('.card');
      const prod = new Product(card);
      myCart.products.push(prod);
      saveCart();
      cartNumEl.textContent = myCart.count;
    });
  });

  // Заполнить попап товарами
  function fillPopup() {
    popupList.innerHTML = '';
    myCart.products.forEach((prod, i) => {
      const item = document.createElement('div');
      item.className = 'popup__product';

      const wrap1 = document.createElement('div');
      wrap1.className = 'popup__product-wrap';
      const img = document.createElement('img');
      img.src = prod.imageSrc;
      img.className = 'popup__product-image';
      const title = document.createElement('h2');
      title.className = 'popup__product-title';
      title.inner
