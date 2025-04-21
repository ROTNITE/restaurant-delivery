// static/js/product-modal.js
window.addEventListener('DOMContentLoaded', () => {
    const productModal = document.getElementById('product-modal');
    if (!productModal) return;
  
    const modalImage    = productModal.querySelector('.product-image');
    const modalTitle    = productModal.querySelector('.modal-title');
    const modalDesc     = productModal.querySelector('.modal-description');
    const modalPrice    = productModal.querySelector('.modal-price');
    const modalControls = productModal.querySelector('.modal-controls');
    const closeBtn      = productModal.querySelector('.close-btn-modal');
  
    document.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.qty-controls') || e.target.closest('.add-to-cart')) return;
  
        const { id, title, price, priceDiscount } = card.dataset;
        const p    = parseFloat(price);
        const pDis = priceDiscount ? parseFloat(priceDiscount) : p;
  
        modalImage.src         = card.dataset.imgUrl      || '';
        modalTitle.textContent = title;
        modalDesc.textContent  = card.dataset.description || '';
        modalPrice.textContent = `${p.toFixed(0)} ₽`;
  
        renderControls(id, title, p, pDis);
  
        document.body.classList.add('no-scroll');
        productModal.classList.add('active');
      });
    });
  
    closeBtn.addEventListener('click', closeModal);
    productModal.addEventListener('click', e => {
      if (e.target === productModal) closeModal();
    });
  
    function closeModal() {
      productModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  
    function renderControls(id, title, price, priceDis) {
      modalControls.innerHTML = '';
      const prod = window.myCart.products.find(p => p.id === id);
      const qty  = prod ? prod.qty : 0;
  
      if (qty > 0) {
        const btnM = document.createElement('button'); btnM.textContent = '–';
        const span = document.createElement('span');  span.textContent = qty;
        const btnP = document.createElement('button'); btnP.textContent = '+';
        modalControls.append(btnM, span, btnP);
  
        btnM.addEventListener('click', e => {
          e.stopPropagation();
          window.myCart.changeQty(id, -1);
          window.updateAll();
          renderControls(id, title, price, priceDis);
        });
        btnP.addEventListener('click', e => {
          e.stopPropagation();
          window.myCart.add(id, title, price, priceDis);
          window.updateAll();
          renderControls(id, title, price, priceDis);
        });
      } else {
        const btnAdd = document.createElement('button');
        btnAdd.className = 'add-to-cart-modal';
        btnAdd.textContent = 'Добавить';
        modalControls.append(btnAdd);
  
        btnAdd.addEventListener('click', e => {
          e.stopPropagation();
          window.myCart.add(id, title, price, priceDis);
          window.updateAll();
          renderControls(id, title, price, priceDis);
        });
      }
    }
  });
  