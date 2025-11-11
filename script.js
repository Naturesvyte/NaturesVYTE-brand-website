/**
 * Nature's VYTE E-Commerce Script
 * Handles product display, shopping cart functionality, 
 * data persistence via localStorage, and rendering on the checkout page.
 */

// --- GLOBAL STATE & PRODUCTS (Must match product data in HTML) ---
const products = [
    { id: 1, name: "VYTE Daily Greens", price: 49.99, unit: "jar" },
    { id: 2, name: "Cogni-Boost Nootropics", price: 34.50, unit: "bottle" },
    { id: 3, name: "Restorative Magnesium Glycinate", price: 22.00, unit: "bottle" },
    { id: 4, name: "Endurance Pre-Workout Mix", price: 39.99, unit: "pouch" }
];

let cart = []; // Array to hold { id, name, price, quantity }

// --- STORAGE FUNCTIONS ---

/**
 * Saves the current cart state to local storage.
 */
function saveCart() {
    try {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    } catch (e) {
        console.error("Could not save cart to localStorage:", e);
    }
}

/**
 * Loads the cart state from local storage.
 */
function loadCart() {
    try {
        const storedCart = localStorage.getItem('shoppingCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        } else {
            cart = [];
        }
    } catch (e) {
        console.error("Could not load cart from localStorage:", e);
        cart = [];
    }
}

// --- CART MANIPULATION FUNCTIONS ---

/**
 * Adds or updates a product in the cart.
 * @param {number} productId 
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        // Only store necessary data in the cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    // Check if the sidebar exists (only on products.html)
    if (document.getElementById('cart-items')) {
        renderCartSidebar();
        alertBox.show(`${product.name} added to cart!`, 'success');
    }
}

// --- RENDERING FUNCTIONS ---

/**
 * Renders the cart contents in the sidebar on products.html.
 */
function renderCartSidebar() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCountEl = document.getElementById('cart-count');

    // CRITICAL CHECK: ensure all required elements exist
    if (!cartItemsEl || !cartTotalEl || !cartCountEl) return;

    cartItemsEl.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="text-sm text-gray-400 p-4">Your vitality journey starts here. Add products!</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <span>${item.name}</span>
                <span class="font-mono text-green-400">
                    <span class="item-qty">x${item.quantity}</span> 
                    $${itemTotal.toFixed(2)}
                </span>
            `;
            cartItemsEl.appendChild(itemEl);
        });
    }

    cartTotalEl.textContent = total.toFixed(2);
    cartCountEl.textContent = itemCount; 
}


/**
 * Renders the order summary on the checkout.html page.
 */
function renderCheckoutSummary() {
    const summaryItemsEl = document.getElementById('summary-items');
    const checkoutTotalEl = document.getElementById('checkout-total');
    
    // CRITICAL CHECK: Check for IDs that exist *only* on checkout.html
    if (!summaryItemsEl || !checkoutTotalEl) {
        console.warn("Checkout summary elements not found. Not rendering.");
        return;
    }

    summaryItemsEl.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        // This replaces the "Loading cart..." message with an empty state
        summaryItemsEl.innerHTML = '<p style="color: #E9FF70; font-style: italic; padding: 1rem;">Your cart is empty. Please return to the products page to select items.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <span>
                    <span class="item-qty">x${item.quantity}</span> ${item.name}
                </span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            summaryItemsEl.appendChild(itemEl);
        });
    }

    checkoutTotalEl.textContent = total.toFixed(2);
}


// --- INITIALIZATION ---

/**
 * Initializes the page: loads cart and sets up event listeners/renders.
 */
function initPage() {
    loadCart();

    const path = window.location.pathname;

    // 1. PRODUCTS PAGE LOGIC (Handling Add to Cart)
    if (path.includes('products.html')) {
        console.log("Initializing Products Page: Setting up listeners and sidebar.");
        renderCartSidebar();
        
        // This attaches the listeners that were failing to fire
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                addToCart(productId);
            });
        });

    // 2. CHECKOUT PAGE LOGIC (Handling Load Cart Issue)
    } else if (path.includes('checkout.html')) {
        console.log("Initializing Checkout Page: Rendering Summary.");
        // This is the CRITICAL call that replaces "Loading cart..."
        renderCheckoutSummary();

        // Optional: Handle form submission for checkout (placeholder)
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alertBox.show('Thank you! Your order has been placed successfully!', 'success');
                cart = []; 
                saveCart();
                renderCheckoutSummary();
            });
        }
    }
}


// --- CUSTOM ALERT BOX (Since window.alert is disallowed) ---

const alertBox = {
    // Basic implementation of an in-page alert box
    el: null,
    init() {
        this.el = document.createElement('div');
        this.el.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: 'Montserrat', sans-serif;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.5s, transform 0.5s;
            transform: translateY(-50px);
            color: #111827;
        `;
        document.body.appendChild(this.el);
    },
    show(message, type = 'info') {
        if (!this.el) this.init();

        let bgColor = '#fff';
        if (type === 'success') bgColor = '#E9FF70'; 
        if (type === 'error') bgColor = '#FF7070'; 
        if (type === 'info') bgColor = '#0077B6';
        
        this.el.style.backgroundColor = bgColor;
        this.el.style.color = type === 'info' ? '#EAEAEA' : '#111827';
        this.el.textContent = message;
        
        this.el.style.opacity = 1;
        this.el.style.transform = 'translateY(0)';

        setTimeout(() => {
            this.el.style.opacity = 0;
            this.el.style.transform = 'translateY(-50px)';
        }, 5000);
    }
};


// Execute initialization when the window loads
window.addEventListener('load', initPage);

// Ensure alert box is initialized
window.addEventListener('load', () => alertBox.init());
