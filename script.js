// =========================================================
// Nature's VYTE: Shopping Cart Logic (script.js) - UPDATED FOR LOCALSTORAGE
// =========================================================

// 1. CORE DATA STRUCTURES
// =========================================================
const products = [
    { id: 1, name: "MegaCreatine", price: 34.99, image: "images/megacreatine.jpg" },
    { id: 2, name: "Women's Health Formula", price: 42.99, image: "images/womens-health.jpg" }
];

let cart = []; 

// =========================================================
// 2. LOCAL STORAGE UTILITY
// =========================================================
function saveCart() {
    // Save the current state of the cart to browser's local storage
    localStorage.setItem('vyteCart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('vyteCart');
    if (savedCart) {
        // Overwrite the empty 'cart' array with the saved data
        cart = JSON.parse(savedCart);
    }
}

// =========================================================
// 3. PRODUCT RENDERING (Only runs on products.html)
// =========================================================
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    // ... (Product rendering code is the same) ...
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>$${product.price.toFixed(2)}</p>
            <p class="product-description">High purity, highly bioavailable formula for peak ${product.id === 1 ? 'strength and focus.' : 'hormonal balance.'}</p>
            <button class="btn add-to-cart" data-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// =========================================================
// 4. CART MANAGEMENT & RENDERING
// =========================================================
function handleAddToCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const product = products.find(p => p.id === productId);

    if (product) {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        // IMPORTANT: Save the cart state after modification
        saveCart(); 
        
        // Visual feedback to the user
        event.target.textContent = 'Added! ✓';
        event.target.disabled = true;
        setTimeout(() => {
            event.target.textContent = 'Add to Cart';
            event.target.disabled = false;
        }, 800);

        // Render both possible cart views (products.html and checkout.html)
        renderCart('cart-items', 'cart-total');
    }
}

function renderCart(itemsContainerId, totalElementId) {
    const cartItemsContainer = document.getElementById(itemsContainerId);
    const cartTotalElement = document.getElementById(totalElementId);

    if (!cartItemsContainer || !cartTotalElement) return;

    // 1. Render items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-message">
            ${itemsContainerId === 'cart-items' ? 'Your vitality sync is pending. Add a formula!' : 'Your cart is empty. Please return to the shop.'}
        </p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            const isCheckout = itemsContainerId === 'summary-items';
            
            // Rendered HTML changes slightly based on the page (products.html vs checkout.html)
            return `
                <div class="${isCheckout ? 'summary-item' : 'cart-item'}">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">x${item.quantity}</span>
                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    // 2. Calculate and render total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}

// =========================================================
// 5. INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Always load the cart state first
    loadCart();

    // 2. Check which page we are on and render the specific views
    const isProductsPage = document.getElementById('product-list');
    const isCheckoutPage = document.getElementById('summary-items');

    if (isProductsPage) {
        renderProducts(); // Render product cards only on products.html
        renderCart('cart-items', 'cart-total'); // Render cart sidebar
    }

    if (isCheckoutPage) {
        renderCart('summary-items', 'checkout-total'); // Render checkout summary
    }
});
