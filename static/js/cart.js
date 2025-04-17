window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  const CART_KEY = 'gourmet_cart';
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');

  const countEl = document.getElementById('cart-count');
  const btnCart  = document.getElementById('cart-btn');
  const modal    = document.getElementById('cart-modal');
  const itemsUl  = document.getElementById('cart-items');
  const form     = document.getElementById('order-form');
  const closeBtn = modal.querySelector('.close-btn');
  const hamb     = document.getElementById('hamburger');
  const side     = document.getElementById('side-menu');

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function updateCount() {
    const total = Object.values(cart).reduce((s,i) => s + i.qty, 0);
    countEl.textContent = total;
    saveCart();
  }

  function renderCart() {
    itemsUl.innerHTML = '';
    let sum = 0;
    for (let [id, it] of Object.entries(cart)) {
      const li = document.createElement('li');
      const line = it.qty * it.price;
      sum += line;
      li.textContent = `${it.title}: ${it.qty} × ${it.price.toFixed(2)}₽`;
      const span = document.createElement('span');
      span.textContent = `${line.toFixed(2)}₽`;
      li.append(span);
      itemsUl.append(li);
    }
    const total = document.createElement('li');
    total.style.fontWeight = 'bold';
    total.style.textAlign  = 'right';
    total.textContent = `Итого: ${sum.toFixed(2)}₽`;
    itemsUl.append(total);
  }

  function toggleCart(show) {
    modal.classList.toggle('hidden', !show);
    if (show) renderCart();
  }

  btnCart.onclick  = () => toggleCart(true);
  closeBtn.onclick = () => toggleCart(false);
  modal.onclick    = e => { if (e.target === modal) toggleCart(false); };

  function makeQty(id, btn) {
    const wrap = document.createElement('div');
    wrap.className = 'qty-controls';
    const minus = document.createElement('button'); minus.textContent = '–';
    const span  = document.createElement('span');  span.textContent  = cart[id].qty;
    const plus  = document.createElement('button'); plus.textContent = '+';
    wrap.append(minus, span, plus);

    minus.onclick = () => {
      cart[id].qty--;
      if (cart[id].qty <= 0) {
        delete cart[id];
        wrap.replaceWith(btn);
      } else {
        span.textContent = cart[id].qty;
      }
      updateCount();
    };
    plus.onclick = () => {
      cart[id].qty++;
      span.textContent = cart[id].qty;
      updateCount();
    };
    return wrap;
  }

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    const { id, title, price } = btn.dataset;
    if (cart[id]) {
      const controls = makeQty(id, btn);
      controls.querySelector('span').textContent = cart[id].qty;
      btn.replaceWith(controls);
    }
    btn.onclick = () => {
      cart[id] = { title, price: +price, qty: 1 };
      updateCount();
      const controls = makeQty(id, btn);
      btn.replaceWith(controls);
    };
  });

  form.onsubmit = e => {
    e.preventDefault();
    if (!Object.keys(cart).length) {
      return alert('Корзина пуста');
    }
    const data = {
      full_name: form['client-name'].value,
      phone:     form['client-phone'].value,
      address:   form['client-address'].value,
      items: Object.entries(cart).map(([dish, it]) => ({ dish, quantity: it.qty }))
    };
    fetch('/api/orders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)[1]
      },
      body: JSON.stringify(data)
    })
    .then(r => r.ok
      ? window.location.href = '/order-success/'
      : alert('Ошибка при отправке'));
  };

  // шторка‑меню
  if (hamb && side) {
    hamb.addEventListener('mouseenter', () => side.classList.add('open'));
    side.addEventListener('mouseleave', () => side.classList.remove('open'));
    side.querySelectorAll('a').forEach(a => {
      a.onclick = e => {
        e.preventDefault();
        side.classList.remove('open');
        document.querySelector(a.getAttribute('href'))
                .scrollIntoView({ behavior: 'smooth' });
      };
    });
  }

  updateCount();
});
