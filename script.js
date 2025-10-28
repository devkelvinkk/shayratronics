let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ====== Format currency in Kenyan Shillings ======
function formatKsh(amount) {
  return `Ksh ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

// ====== Fetch Products ======
fetch('/shayratronics/products.json')

  .then(res => res.json())
  .then(data => {
    products = data;
    displayProducts(products);
    updateCartCount();
  });

// ====== Display Products ======
function displayProducts(productList) {
  const container = document.getElementById('product-list');
  if (!container) return;

  container.innerHTML = '';
  productList.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
  <img src="${product.image}" alt="${product.name}">
  <h3>${product.name}</h3>
  <div class="rating">${generateStars(product.rating || 4)}</div>
  <p>Kes${product.price.toLocaleString()}</p>
  <div class="product-buttons">
    <button onclick="addToCart(${product.id})">Add to Cart</button>
    <button onclick="viewDetails(${product.id})" class="details-btn">View Details</button>
  </div>
`;

    container.appendChild(div);
  });
}
function generateStars(rating) {
  const fullStar = '★';
  const emptyStar = '☆';
  return fullStar.repeat(Math.floor(rating)) + emptyStar.repeat(5 - Math.floor(rating));
}


// ====== AI Recommendations ======
function displayRecommendations() {
  const recContainer = document.createElement('div');
  recContainer.id = 'recommendations';
  recContainer.innerHTML = '<h3>Recommended for You</h3>' +
    products
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(p => `<div class="product-small"><img src="${p.image}" alt="${p.name}"><p>${p.name}</p></div>`)
      .join('');
  document.body.insertBefore(recContainer, document.getElementById('product-list'));
}

// ====== Dark Mode Integration ======
const darkModeBtn = document.getElementById('dark-mode-toggle');
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// ====== Add to Cart ======
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
  openCartSidebar();
  showToast(`${product.name} added to cart!`);
}

// ====== Cart Sidebar ======
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const closeCartBtn = document.getElementById('close-cart');
const placeOrderBtn = document.getElementById('place-order');

document.getElementById('cart').addEventListener('click', openCartSidebar);
closeCartBtn.addEventListener('click', () => cartSidebar.style.right = '-350px');

function openCartSidebar() {
  displayCart();
  cartSidebar.style.right = '0';
}

// ====== Display Cart ======
function displayCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <p>${item.name}</p>
          <p>${formatKsh(item.price)} x ${item.quantity}</p>
        </div>
        <div class="cart-controls">
          <button onclick="changeQuantity(${item.id}, -1)">-</button>
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
          <button onclick="removeFromCart(${item.id})">❌</button>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });
  }

  cartTotal.innerHTML = `<strong>Total:</strong> ${formatKsh(total.toFixed(2))}`;
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ====== Change Quantity ======
function changeQuantity(id, change) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(id);
  } else {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
  }
}

// ====== Remove from Cart ======
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

// ====== Update Cart Count ======
function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const countElement = document.getElementById('cart-count');
  if (countElement) countElement.textContent = count;
}

// ====== Place Order ======
placeOrderBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  alert('✅ Order placed successfully!');
  cart = [];
  localStorage.removeItem('cart');
  updateCartCount();
  displayCart();
  cartSidebar.style.right = '-350px';
});

// ====== Product Details Modal ======
function viewDetails(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('modal-content');

  modalContent.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p><strong>Price:</strong> ${formatKsh(product.price)}</p>
    <p><strong>Stock:</strong> ${product.stock > 0 ? product.stock + ' available' : 'Out of stock'}</p>
    <p><strong>Description:</strong> High-quality ${product.name.toLowerCase()} perfect for your electronics needs.</p>
    <div class="modal-buttons">
      <button ${product.stock === 0 ? 'disabled' : ''} onclick="addToCart(${product.id})" class="add-cart-modal">Add to Cart</button>
      <button onclick="closeModal()" id="close-modal">Close</button>
    </div>
  `;
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('product-modal').style.display = 'none';
}

// ====== Search Functionality ======
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm)
    );
    displayProducts(filtered);
  });
}

// ====== Toast Notifications ======
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2500);
}

// ====== Category Filters ======
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');

    const category = btn.dataset.category;
    if (category === 'all') {
      displayProducts(products);
    } else {
      const filtered = products.filter(p => p.category === category);
      displayProducts(filtered);
    }
  });
});
