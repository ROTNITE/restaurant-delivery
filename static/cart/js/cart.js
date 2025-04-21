// static/js/cart.js
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  // === Helpers ===
  const CURRENCY = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 });
  const toNum = str => Number(str.replace(/\s+/g, ''));

  // === Models ===
  class Cart {
    constructor() { this.products = []; }
    get count() { return this.products.reduce((s,p)=>s+p.qty,0); }
    add(id, title, price, priceDiscount = price) {
      const ex = this.products.find(x=>x.id===id);
      if (ex) ex.qty++;
      else this.products.push({ id, title, price, priceDiscount, qty: 1 });
    }
    changeQty(id, delta) {
      const p = this.products.find(x=>x.id===id);
      if (!p) return;
      p.qty += delta;
      if (p.qty < 1) this.products = this.products.filter(x=>x.id!==id);
    }
    get cost() { return this.products.reduce((s,p)=>s+p.price*p.qty,0); }
    get costDiscount() { return this.products.reduce((s,p)=>s+p.priceDiscount*p.qty,0); }
    get discount() { return this.cost - this.costDiscount; }
  }

  const CART_KEY = 'gourmet_cart';
  const EXPIRATION = 1000*60*60*24;
  const myCart = new Cart();

  // === Load ===
  (function loadCart(){
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY));
      if (saved && saved._ts && Date.now() - saved._ts < EXPIRATION && Array.isArray(saved.products)) {
        myCart.products = saved.products;
      } else {
        localStorage.removeItem(CART_KEY);
      }
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  })();

  // === Persist ===
  function persist() {
    localStorage.setItem(CART_KEY, JSON.stringify({
      products: myCart.products,
      _ts: Date.now()
    }));
  }

  // === DOM refs ===
  const cartBtn     = document.getElementById('cart-btn');
  const cartCountEl = document.getElementById('cart-count');
  const cartModal   = document.getElementById('cart-modal');
  const itemsUl     = document.getElementById('cart-items');
  const orderForm   = document.getElementById('order-form');
  const closeCart   = cartModal.querySelector('.close-btn');
  const cards       = document.querySelectorAll('.dish-card');
  const productModal= document.getElementById('product-modal');
  const modalImg    = productModal.querySelector('.product-image');
  const modalTitle  = productModal.querySelector('.modal-title');
  const modalDesc   = productModal.querySelector('.modal-description');
  const modalPrice  = productModal.querySelector('.modal-price');
  const addModalBtn = productModal.querySelector('.add-to-cart-modal');
  const closeProd   = productModal.querySelector('.close-btn-modal');

  // === Update UI ===
  function updateAll() {
    // Header count
    cartCountEl.textContent = myCart.count;
    // Persist immediately
    persist();
    // Mini-cart
    itemsUl.innerHTML = '';
    let sum = 0;
    myCart.products.forEach(p => {
      const line = p.qty * p.priceDiscount;
      sum += line;
      const li = document.createElement('li');
      li.textContent = `${p.title}: ${p.qty} × ${p.priceDiscount.toFixed(2)} ₽`;
      const span = document.createElement('span');
      span.textContent = `${line.toFixed(2)} ₽`;
      li.append(span);
      itemsUl.append(li);
    });
    const totalLi = document.createElement('li');
    totalLi.style.fontWeight = 'bold';
    totalLi.style.textAlign  = 'right';
    totalLi.textContent = `Итого: ${sum.toFixed(2)} ₽`;
    itemsUl.append(totalLi);

    // Cards: add-btn ⇄ qty-controls
    cards.forEach(card => {
      const id   = card.dataset.id;
      const idx  = myCart.products.findIndex(p => p.id === id);
      const has  = idx >= 0;
      const btn  = card.querySelector('.add-to-cart');
      const ctrl = card.querySelector('.qty-controls');

      if (has) {
        // render controls if not present
        if (!ctrl) {
          const newCtrl = makeQtyControls(id);
          (btn || card.querySelector('button')).replaceWith(newCtrl);
        } else {
          // update existing count
          ctrl.querySelector('span').textContent = myCart.products[idx].qty;
        }
      } else {
        // render add button if not present
        if (!btn) {
          const newBtn = makeAddButton(card);
          ctrl.replaceWith(newBtn);
        }
      }
    });
  }

  // === Controls builders ===
  function makeQtyControls(id) {
    const wrap = document.createElement('div');
    wrap.className = 'qty-controls';
    const btnM = document.createElement('button'); btnM.textContent = '–';
    const span = document.createElement('span');
    const btnP = document.createElement('button'); btnP.textContent = '+';
    const prod = myCart.products.find(p=>p.id===id);
    span.textContent = prod.qty;
    wrap.append(btnM, span, btnP);
    btnM.addEventListener('click', e => { e.stopPropagation(); myCart.changeQty(id, -1); updateAll(); });
    btnP.addEventListener('click', e => { e.stopPropagation(); myCart.changeQty(id, +1); updateAll(); });
    return wrap;
  }
  function makeAddButton(card) {
    const btn = document.createElement('button');
    btn.className = 'add-to-cart';
    btn.textContent = 'Добавить';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const { id, title, price, priceDiscount } = card.dataset;
      myCart.add(
        id, title,
        parseFloat(price),
        priceDiscount ? parseFloat(priceDiscount) : parseFloat(price)
      );
      updateAll();
    });
    return btn;
  }

  // === Cart modal toggle ===
  function toggleCart(show) {
    cartModal.classList.toggle('hidden', !show);
  }
  cartBtn.addEventListener('click', ()=> { toggleCart(true); });
  closeCart.addEventListener('click', ()=> { toggleCart(false); });
  cartModal.addEventListener('click', e => { if (e.target === cartModal) toggleCart(false); });

  // === Product modal (unchanged) ===
  cards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.qty-controls') || e.target.closest('.add-to-cart')) return;
      modalImg.src           = card.dataset.imgUrl      || '';
      modalTitle.textContent = card.dataset.title       || '';
      modalDesc.textContent  = card.dataset.description || '';
      modalPrice.textContent = `${card.dataset.price} ₽`;
      document.body.classList.add('no-scroll');
      addModalBtn.onclick = evt => {
        evt.stopPropagation();
        card.querySelector('.add-to-cart').click();
        productModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      };
      productModal.classList.add('active');
    });
  });
  closeProd.addEventListener('click', () => {
    productModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
  productModal.addEventListener('click', e => {
    if (e.target===productModal) {
      productModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });

  // === Order form ===
  orderForm.addEventListener('submit', e => {
    e.preventDefault();
    if (myCart.count === 0) return alert('Корзина пуста');
    const data = {
      full_name: orderForm['client-name'].value,
      phone:     orderForm['client-phone'].value,
      address:   orderForm['client-address'].value,
      items:     myCart.products.map(p => ({ dish: p.id, quantity: p.qty }))
    };
    fetch('/api/orders/', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1]
      },
      body: JSON.stringify(data)
    })
    .then(r => r.ok
      ? window.location.href = '/order-success/'
      : alert('Ошибка при отправке')
    )
    .catch(() => alert('Ошибка сети'));
  });

  // === Init ===
  updateAll();
});
