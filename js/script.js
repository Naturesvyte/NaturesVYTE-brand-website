// Mobile Menu
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
if(mobileMenu) mobileMenu.addEventListener('click', () => { navLinks.classList.toggle('active'); });

// Shopping Cart
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const addToCartBtns = document.querySelectorAll('.add-to-cart');
const checkoutBtn = document.getElementById('checkout-btn');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCart() {
  if(!cartItemsEl) return;
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach((item,index) => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - $${item.price}`;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.style.marginLeft='10px';
    removeBtn.addEventListener('click', () => { cart.splice(index,1); updateCart(); });
    li.appendChild(removeBtn);
    cartItemsEl.appendChild(li);
    total += parseFloat(item.price);
  });
  cartTotalEl.textContent = total.toFixed(2);
  localStorage.setItem('cart', JSON.stringify(cart));
}

addToCartBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = btn.dataset.price;
    const priceId = btn.dataset.priceId;
    cart.push({name, price, priceId});
    updateCart();
    alert(`${name} added to cart!`);
  });
});

// Checkout Button (requires serverless function)
if(checkoutBtn) checkoutBtn.addEventListener('click', async () => {
  if(cart.length===0){ alert('Cart is empty'); return; }
  const lineItems = cart.map(item => ({ price: item.priceId, quantity: 1 }));
  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ lineItems })
    });
    const session = await response.json();
    window.location.href = session.url;
  } catch(e){ alert('Checkout failed'); console.error(e); }
});

// Newsletter
const newsletterForm = document.getElementById('newsletter-form');
const newsletterMsg = document.getElementById('newsletter-msg');
if(newsletterForm) newsletterForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const email = newsletterForm.querySelector('input').value;
  newsletterMsg.textContent = `Thanks, ${email}! Subscribed.`;
  newsletterForm.reset();
});

updateCart();
