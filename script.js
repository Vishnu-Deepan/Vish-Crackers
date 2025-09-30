// Select DOM elements
const container = document.getElementById("product-container");
const viewCartBtn = document.getElementById("view-cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartSummary = document.getElementById("cart-summary");
const closeCartBtn = document.getElementById("close-cart-btn");

// Cart object to store selected products
let cart = {};

// Helper to update the cart button state
function updateCartButton() {
    const hasItems = Object.keys(cart).length > 0;
    viewCartBtn.disabled = !hasItems;
}

// Render categories and products dynamically from `products.js`
productsData.forEach((cat, index) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";

    // Category Header with toggle dropdown-like icon
    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
        <img src="path/to/icon.png" alt="Category Icon">
        <span class="title">${cat.category}</span>
        <span class="toggle-icon">▼</span>
    `;

    // Product Table (hidden initially)
    const table = document.createElement("table");
    table.className = "product-table";
    table.style.display = "none";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Price (₹)</th>
                <th>Add</th>
                <th>Qty</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    // Add products for this category
    cat.items.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.unit}</td>
            <td class="price">${item.price}</td>
            <td><input type="checkbox" id="chk-${index}-${item.id}" title="Add to cart"></td>
            <td><input type="number" class="quantity-input" min="1" value="1" style="display: none;"></td>
        `;

        // Add event listeners for checkbox and quantity
        const checkbox = row.querySelector("input[type='checkbox']");
        const qtyInput = row.querySelector("input[type='number']");
        
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                qtyInput.style.display = "inline-block";
                cart[item.name] = { ...item, quantity: parseInt(qtyInput.value, 10) };
            } else {
                qtyInput.style.display = "none";
                delete cart[item.name];
            }
            updateCartButton();
        });

        qtyInput.addEventListener("input", () => {
            if (checkbox.checked) {
                let val = parseInt(qtyInput.value, 10);
                if (isNaN(val) || val < 1) {
                    val = 1;
                    qtyInput.value = val;
                }
                cart[item.name].quantity = val;
            }
        });

        tbody.appendChild(row);
    });

    // Toggle visibility of product table
    header.addEventListener("click", () => {
        if (table.style.display === "none") {
            table.style.display = "table";
            header.querySelector(".toggle-icon").textContent = "▲";
        } else {
            table.style.display = "none";
            header.querySelector(".toggle-icon").textContent = "▼";
        }
    });

    // Append category and table
    categoryDiv.appendChild(header);
    categoryDiv.appendChild(table);
    container.appendChild(categoryDiv);
});

// Handle Cart Modal visibility
viewCartBtn.addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
        alert("Cart is empty!");
        return;
    }
    renderCartSummary();
    cartModal.classList.remove("hidden");
});

closeCartBtn.addEventListener("click", () => {
    cartModal.classList.add("hidden");
});

// Render cart summary in modal
function renderCartSummary() {
    if (Object.keys(cart).length === 0) {
        cartSummary.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    let html = `<table>
        <thead>
            <tr><th>Product</th><th>Unit</th><th>Price (₹)</th><th>Qty</th><th>Total (₹)</th></tr>
        </thead>
        <tbody>`;
    
    let grandTotal = 0;
    for (const key in cart) {
        const item = cart[key];
        const total = item.price * item.quantity;
        grandTotal += total;

        html += `
            <tr>
                <td>${item.name}</td>
                <td>${item.unit}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
                <td>${total}</td>
            </tr>`;
    }

    html += `
        </tbody>
        <tfoot>
            <tr>
                <th colspan="4" style="text-align:right;">Grand Total:</th>
                <th>₹${grandTotal}</th>
            </tr>
        </tfoot>
    </table>`;

    cartSummary.innerHTML = html;
}