/**
 * Nature's VYTE E-Commerce Script
 * Handles dynamic product generation, shopping cart functionality, 
 * data persistence via localStorage, and rendering on the checkout page.
 */

// --- GLOBAL STATE & PRODUCTS (With image file names mapped to IDs) ---
// IMPORTANT: Update 'image' paths if your file names are different!
const products = [
    { id: 1, name: "VYTE Daily Greens", price: 49.99, unit: "jar", image: "images/greens.jpg", description: "The foundation of a balanced life. 30 servings of phytonutrients, antioxidants, and digestive enzymes." },
    { id: 2, name: "Cogni-Boost Nootropics", price: 34.50, unit: "bottle", image: "images/cogni.jpg", description: "Enhance focus and mental clarity with our blend of Lion's Mane and B-vitamins for optimal brain health." },
    { id: 3, name: "Restorative Magnesium Glycinate", price: 22.00, unit: "bottle", image: "images/magnesium.jpg", description: "High-absorption magnesium glycinate for muscle recovery and deep, restful sleep." },
    { id: 4, name: "Endurance Pre-Workout Mix", price: 39.99, unit: "pouch", image: "images/preworkout.jpg", description: "Clean energy and sustained focus without the jitters. Fuel your workouts naturally." }
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

// --- RENDERING FUNCTIONS ---

/**
 * Dynamically generates the product cards and inserts them into the HTML.
 */
function renderProducts() {
    const productListEl = document.getElementById('product-list');
    if (!productListEl) return;

    productListEl.innerHTML = ''; // Clear any existing content

    products.forEach(product => {
        const productCardHtml = `
            <div class="product-card">
                <img src="${product.image}" 
                    onerror="this.src='https://placehold.co/200x200/444444/EAEAEA?text=Image+Missing'"
                    alt="${product.name} Supplement">
                <h4>${product.name}</h4>
                <p>$${product.price.toFixed(2)}</p>
                <div class="product-description">${product.description}</div>
                <!-- data-product-id is CRITICAL for the add-to-cart listener -->
                <button class="btn add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productListEl.insertAdjacentHTML('beforeend', productCardHtml);
    });

    // CRITICAL: Attach listeners *after* products are rendered
    attachAddToCartListeners();
}

/**
 * Attaches click event listeners to all 'Add to Cart' buttons.
 */
function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        // Ensure we only add the listener once
        button.removeEventListener('click', handleAddToCartClick);
        button.addEventListener('click', handleAddToCartClick);
    });
}

/**
 * Event handler for adding a product to the cart.
 */
function handleAddToCartClick(e) {
    const productId = parseInt(e.target.dataset.productId);
    addToCart(productId);
}


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
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    // Check if the cart is visible on this page (products.html)
    if (document.getElementById('cart-items')) {
        renderCartSidebar();
        alertBox.show(`${product.name} added to cart!`, 'success');
    }
}


/**
 * Renders the cart contents in the sidebar on products.html.
 */
function renderCartSidebar() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');

    // CRITICAL CHECK: ensure all required elements exist
    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart-message">Your vitality sync is pending. Add a formula!</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-qty">x${item.quantity}</span> 
                <span class="item-price">$${itemTotal.toFixed(2)}</span>
            `;
            cartItemsEl.appendChild(itemEl);
        });
    }

    cartTotalEl.textContent = total.toFixed(2);
}


/**
 * Renders the order summary on the checkout.html page.
 */
function renderCheckoutSummary() {
    const summaryItemsEl = document.getElementById('summary-items');
    const checkoutTotalEl = document.getElementById('checkout-total');
    
    // Check for IDs that exist *only* on checkout.html
    if (!summaryItemsEl || !checkoutTotalEl) {
        return;
    }

    summaryItemsEl.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        summaryItemsEl.innerHTML = '<p style="color: var(--color-accent); font-style: italic; padding: 1rem; text-align: center;">Your cart is empty. Please return to the products page to select items.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item'; // Assume checkout.html has this class for styling
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
            z-index: 9999;
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


// --- INITIALIZATION ---

/**
 * Initializes the page: loads cart and sets up event listeners/renders.
 */
function initPage() {
    loadCart();

    const path = window.location.pathname;

    if (path.includes('products.html')) {
        // Renders products (with images) and attaches listeners
        renderProducts(); 
        // Renders the cart sidebar (always based on the loaded cart)
        renderCartSidebar();

    } else if (path.includes('checkout.html')) {
        // Renders the order summary on the checkout page
        renderCheckoutSummary();

        // Placeholder for checkout form submission (if form exists)
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alertBox.show('Thank you! Your order has been placed successfully!', 'success');
                cart = []; 
                saveCart();
                // Redirect user back to home or products after purchase
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 3000);
            });
        }
    }
}


// Execute initialization when the window loads
window.addEventListener('load', initPage);

// Ensure alert box is initialized
window.addEventListener('load', () => alertBox.init());
