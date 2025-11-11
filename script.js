// =========================================================
// Nature's VYTE: Shopping Cart Logic (script.js)
// =========================================================

// 1. CORE DATA STRUCTURES
// =========================================================
const products = [
    { id: 1, name: "MegaCreatine", price: 34.99, image: "images/megacreatine.jpg" },
    { id: 2, name: "Women's Health Formula", price: 42.99, image: "images/womens-health.jpg" }
];

// Cart initialized as an empty array
let cart = []; 

// =========================================================
// 2. PRODUCT RENDERING
// Assumes a container on products.html with id="product-list"
// =========================================================
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    // Map through the products array to create the HTML structure for each card
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

    // Attach event listeners to the 'Add to Cart' buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// =========================================================
// 3. CART MANAGEMENT
// =========================================================
function handleAddToCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const product = products.find(p => p.id === productId);

    if (product) {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            // Increment quantity if product already exists
            existingItem.quantity++;
        } else {
            // Add new item to cart
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        // Visual feedback to the user
        event.target.textContent = 'Added! ✓';
        event.target.disabled = true; // Disable button briefly
        setTimeout(() => {
            event.target.textContent = 'Add to Cart';
            event.target.disabled = false;
        }, 800);

        renderCart(); 
    }
}

// Renders the cart items and updates the total in the cart sidebar
// Assumes a container on products.html with id="cart-items"
// Assumes a span on products.html with id="cart-total"
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (!cartItemsContainer || !cartTotalElement) return;

    // 1. Render items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your vitality sync is pending. Add a formula!</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <div class="item-controls">
                    <span class="item-qty">x${item.quantity}</span>
                </div>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    // 2. Calculate and render total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}

// =========================================================
// 4. INITIALIZATION
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Start the process when the page is fully loaded
    renderProducts(); 
    renderCart();
});
