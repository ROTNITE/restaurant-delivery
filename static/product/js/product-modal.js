// Модалка товара
window.addEventListener('DOMContentLoaded', () => {
    const productModal = document.getElementById('product-modal');
    const addModalBtn = productModal?.querySelector('.add-to-cart-modal');
    const closeProdBtn = productModal?.querySelector('.close-btn-modal');
    if (!productModal) return;
    document.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.qty-controls') || e.target.closest('.add-to-cart')) return;
        const img = productModal.querySelector('.product-image');
        const title = productModal.querySelector('.modal-title');
        const desc = productModal.querySelector('.modal-description');
        const price = productModal.querySelector('.modal-price');
        img.src = card.dataset.imgUrl || '';
        title.textContent = card.dataset.title || '';
        desc.textContent = card.dataset.description || '';
        price.textContent = (card.dataset.price || '') + ' ₽';
        document.body.classList.add('no-scroll');
        addModalBtn.onclick = evt => {
          evt.stopPropagation();
          card.querySelector('.add-to-cart')?.click();
          productModal.classList.remove('active');
          document.body.classList.remove('no-scroll');
        };
        productModal.classList.add('active');
      });
    });
    closeProdBtn?.addEventListener('click', () => {
      productModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
    productModal.addEventListener('click', e => {
      if (e.target === productModal) {
        productModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  });