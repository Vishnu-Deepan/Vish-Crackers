console.log("script.js loaded!");

let currentCategory = 'all';

/* ========== Cart Helpers ========== */
function getCartData() {
  const cart = sessionStorage.getItem('cart');
  return cart ? JSON.parse(cart) : {};
}

function saveCartData(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCartIcon();
}

function updateCartIcon() {
  const cart = getCartData();
  const cartCount = Object.values(cart).reduce((t, item) => t + item.quantity, 0);
  document.getElementById('cart-count').textContent = cartCount;
  const wrapper = document.getElementById('cart-proceed-wrapper');
  if (wrapper) wrapper.style.display = cartCount > 0 ? 'flex' : 'none';
}

/* ========== Cart Actions ========== */
function addToCart(item) {
  const cart = getCartData();
  if (cart[item.id]) {
    cart[item.id].quantity += 1;
  } else {
    cart[item.id] = {
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      unit: item.unit,
      id: item.id,
      quantity: 1
    };
  }
  saveCartData(cart);
  displayProducts(currentCategory);
}

function removeFromCart(id) {
  const cart = getCartData();
  if (cart[id]) {
    delete cart[id];
    saveCartData(cart);
    displayProducts(currentCategory);
  }
}

function increaseQuantity(id) {
  const cart = getCartData();
  if (cart[id]) {
    cart[id].quantity++;
    saveCartData(cart);
    displayProducts(currentCategory);
  }
}

function decreaseQuantity(id) {
  const cart = getCartData();
  if (cart[id]) {
    cart[id].quantity > 1 ? cart[id].quantity-- : delete cart[id];
    saveCartData(cart);
    displayProducts(currentCategory);
  }
}

/* ========== Render Cart Overlay ========== */
function renderCartOverlay() {
  const cart = getCartData();
  const list = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total-value');
  list.innerHTML = '';

  let total = 0, saved = 0;

  if (Object.keys(cart).length === 0) {
    list.innerHTML = '<p>Your cart is empty.</p>';
    totalEl.textContent = '0.00';
    document.getElementById('cart-proceed-wrapper').style.display = 'none';
    return;
  }

  Object.values(cart).forEach(item => {
    const subtotal = item.price * item.quantity;
    const perSave = Math.max(0, (item.originalPrice || item.price) - item.price);
    const itemSave = perSave * item.quantity;

    total += subtotal;
    saved += itemSave;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-details">
        <span>Qty: ${item.quantity}</span>
        <span>Price: ₹${item.price.toFixed(2)}</span>
        <span>Total: ₹${subtotal.toFixed(2)}</span>
      </div>
      ${itemSave > 0 ? `<div class="cart-item-saved">You saved ₹${itemSave.toFixed(2)} on this item</div>` : ''}
    `;
    list.appendChild(div);
  });

  totalEl.textContent = total.toFixed(2);

  const savedRow = document.createElement('div');
  savedRow.style.textAlign = 'right';
  savedRow.style.marginTop = '12px';
  savedRow.innerHTML = `<strong>Total Saved: ₹${saved.toFixed(2)}</strong>`;
  list.appendChild(savedRow);

  document.getElementById('cart-proceed-wrapper').style.display = 'flex';
}

/* ========== Category Display ========== */
function displayProducts(selected = 'all') {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = '';
  const cart = getCartData();

  productsData.forEach(cat => {
    if (selected === 'all' || selected === cat.category) {
      const section = document.createElement('section');
      const title = document.createElement('h2');
      title.classList.add('category-title');
      title.textContent = cat.category;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.classList.add('product-grid');

      cat.items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        const img = document.createElement('img');
        img.src = item.image || 'assets/placeholder.jpg';
        card.appendChild(img);

        const content = document.createElement('div');
        content.classList.add('product-card-content');

        const name = document.createElement('div');
        name.classList.add('product-name');
        name.textContent = item.name;
        content.appendChild(name);

        const price = document.createElement('div');
        price.classList.add('product-price');
        price.textContent = `₹${item.price.toFixed(2)}`;
        content.appendChild(price);

        const oPrice = document.createElement('div');
        oPrice.classList.add('product-original-price');
        oPrice.textContent = `₹${item.originalPrice.toFixed(2)}`;
        content.appendChild(oPrice);

        const unit = document.createElement('div');
        unit.classList.add('product-unit');
        unit.textContent = item.unit;
        content.appendChild(unit);

        const inCart = cart[item.id];
        if (inCart) {
          const controls = document.createElement('div');
          controls.classList.add('quantity-controls');

          const minus = document.createElement('button');
          minus.textContent = '−';
          minus.classList.add('quantity-btn');
          minus.addEventListener('click', () => decreaseQuantity(item.id));

          const disp = document.createElement('span');
          disp.classList.add('quantity-display');
          disp.textContent = inCart.quantity;

          const plus = document.createElement('button');
          plus.textContent = '+';
          plus.classList.add('quantity-btn');
          plus.addEventListener('click', () => increaseQuantity(item.id));

          controls.appendChild(minus);
          controls.appendChild(disp);
          controls.appendChild(plus);
          content.appendChild(controls);

          const removeBtn = document.createElement('button');
          removeBtn.classList.add('remove-from-cart-btn');
          removeBtn.textContent = 'Remove from Cart';
          removeBtn.addEventListener('click', () => removeFromCart(item.id));
          content.appendChild(removeBtn);
        } else {
          const addBtn = document.createElement('button');
          addBtn.classList.add('add-to-cart-btn');
          addBtn.textContent = 'Add to Cart';
          addBtn.addEventListener('click', () => addToCart(item));
          content.appendChild(addBtn);
        }

        card.appendChild(content);
        grid.appendChild(card);
      });

      section.appendChild(grid);
      productsContainer.appendChild(section);
    }
  });
}

/* ========== Dropdown Handling ========== */
function populateCategoryDropdown() {
  const list = document.getElementById('dropdown-list');
  const all = document.createElement('li');
  all.classList.add('dropdown-item');
  all.dataset.value = 'all';
  const span = document.createElement('span');
  span.classList.add('dropdown-item-text');
  span.textContent = 'All Categories';
  all.appendChild(span);
  all.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelector('.dropdown-selected').textContent = 'All Categories';
    currentCategory = 'all';
    displayProducts(currentCategory);
    toggleDropdown();
  });
  list.appendChild(all);

  productsData.forEach(cat => {
    const li = document.createElement('li');
    li.classList.add('dropdown-item');
    li.dataset.value = cat.category;

    const img = document.createElement('img');
    img.src = cat.image || 'assets/placeholder.jpg';
    img.classList.add('dropdown-item-image');

    const text = document.createElement('span');
    text.classList.add('dropdown-item-text');
    text.textContent = cat.category;

    li.appendChild(img);
    li.appendChild(text);
    li.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelector('.dropdown-selected').textContent = cat.category;
      currentCategory = cat.category;
      displayProducts(currentCategory);
      toggleDropdown();
    });

    list.appendChild(li);
  });
}

function toggleDropdown() {
  document.getElementById('dropdown-list').classList.toggle('show');
}

/* ========== Modal & Proceed Handling ========== */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvpnb5IKddVi978E7kh0ZMZw7uJIHQbfDE_9oH4wyGUim2cb2McVElB9CBDB59PPPNrQ/exec'; // replace with deployed URL

document.getElementById('cart-icon').addEventListener('click', () => {
  renderCartOverlay();
  document.getElementById('cart-overlay').classList.add('show');
});

document.getElementById('close-cart-overlay').addEventListener('click', () => {
  document.getElementById('cart-overlay').classList.remove('show');
  document.getElementById('cart-proceed-wrapper').style.display = 'none';
});

// document.getElementById('cart-proceed-btn').addEventListener('click', () => {
//   const cart = getCartData();
//   if (Object.keys(cart).length === 0) {
//     // Optionally show a message or just ignore the click if cart is empty
//     alert("Your cart is empty. Please add items before proceeding.");
//     return;
//   }
//   document.getElementById('phone-modal').classList.add('show');
//   document.getElementById('modal-msg').textContent = '';
// });


document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('phone-modal').classList.remove('show');
});


document.getElementById('inquire-btn').addEventListener('click', () => {
  const phone = document.getElementById('phone-number').value.trim();
  if (!phone) {
    document.getElementById('modal-msg').textContent = 'Enter valid phone number';
    return;
  }

  const btn = document.getElementById('inquire-btn');
  btn.disabled = true;
  document.getElementById('modal-msg').textContent = 'Submitting…';

  // Remove old script to prevent duplicates
  const oldScript = document.getElementById('jsonp-script');
  if (oldScript) oldScript.remove();

  // Global callback for JSONP
  window.handleResponse = function(data) {
  const phoneInput = document.getElementById('phone-number');
  const inquireBtn = document.getElementById('inquire-btn');
  if (data.status === 'ok') {
    document.getElementById('modal-msg').textContent = 'Thanks! We’ll contact you on WhatsApp within 24 hrs.';
    // Disable phone input and button on success
    phoneInput.disabled = true;
    inquireBtn.disabled = true;
  } else {
    document.getElementById('modal-msg').textContent = 'Error submitting — try again later.';
    // Enable inputs to allow retry after error
    phoneInput.disabled = false;
    inquireBtn.disabled = false;
  }
};


  // Create JSONP <script> to call Apps Script
  const script = document.createElement('script');
  script.src = APPS_SCRIPT_URL 
               + '?phone=' + encodeURIComponent(phone)
               + '&cart=' + encodeURIComponent(JSON.stringify(getCartData()))
               + '&callback=handleResponse';
  script.id = 'jsonp-script';
  document.body.appendChild(script);
});




/* ========== Init ========== */
window.onload = function () {
  populateCategoryDropdown();
  displayProducts(currentCategory);
  updateCartIcon();

  // Safe to attach event listeners now
  document.getElementById('cart-proceed-btn').addEventListener('click', () => {
  const cart = getCartData();
  if (Object.keys(cart).length === 0) {
    // Optionally show a message or just ignore the click if cart is empty
    alert("Your cart is empty. Please add items before proceeding.");
    return;
  }
  document.getElementById('phone-modal').classList.add('show');
  document.getElementById('modal-msg').textContent = '';
});


  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("phone-modal").classList.remove("show");
  });

  document.getElementById("close-cart-overlay").addEventListener("click", () => {
    document.getElementById("cart-overlay").classList.remove("show");
  });
};

window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = 'Are you sure you want to leave? Cart items will be deleted.';
});

window.addEventListener('unload', function () {
  sessionStorage.removeItem('cart');
});


document.getElementById('category-dropdown').addEventListener('click', e => {
  e.stopPropagation();
  toggleDropdown();
});

document.addEventListener('click', e => {
  if (!e.target.closest('.custom-dropdown')) {
    document.getElementById('dropdown-list').classList.remove('show');
  }
});