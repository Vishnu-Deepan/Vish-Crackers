const container = document.getElementById("product-container");
const viewCartBtn = document.getElementById("view-cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartSummary = document.getElementById("cart-summary");
const closeCartBtn = document.getElementById("close-cart-btn");
const confirmEnquiryBtn = document.getElementById("confirm-enquiry-btn");
const addressForm = document.getElementById("address-form");


let cart = {};

// Helper: update cart button state
function updateCartButton() {
  const hasItems = Object.keys(cart).length > 0;
  viewCartBtn.disabled = !hasItems;
}

// Render all categories with only subcategory name and "Show All Products" button
productsData.forEach((cat, index) => {
  const categoryDiv = document.createElement("div");
  categoryDiv.className = "category";

  // Header with toggle
  const header = document.createElement("div");
  header.className = "category-header";
  header.innerHTML = `
    <span>${cat.category}</span>
    <span class="toggle-icon">+</span>
  `;

  // Product Table container (hidden initially)
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

  cat.items.forEach((item, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.unit}</td>
      <td>${item.price}</td>
      <td></td>
      <td></td>
    `;

    // Add checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `chk-${index}-${i}`;
    checkbox.title = "Add to cart";

    // Quantity input
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = "1";

    // Show qty only if added
    qtyInput.style.display = "none";

    // Add checkbox and qty to cells
    row.cells[3].appendChild(checkbox);
    row.cells[4].appendChild(qtyInput);

    // Event handlers
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        qtyInput.style.display = "inline-block";
        cart[item.name] = {
          ...item,
          quantity: parseInt(qtyInput.value, 10),
        };
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

  // Toggle show/hide products on header click
  header.addEventListener("click", () => {
    if (table.style.display === "none") {
      table.style.display = "table";
      header.querySelector(".toggle-icon").textContent = "−";
    } else {
      table.style.display = "none";
      header.querySelector(".toggle-icon").textContent = "+";
    }
  });

  categoryDiv.appendChild(header);
  categoryDiv.appendChild(table);
  container.appendChild(categoryDiv);
});

// Show Cart modal with summary
viewCartBtn.addEventListener("click", () => {
  renderCartSummary();
  cartModal.classList.remove("hidden");
});

// Close Cart modal
closeCartBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

// Confirm enquiry
confirmEnquiryBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }

  if (!addressForm.reportValidity()) {
    alert("Please fill out your complete address information correctly.");
    return;
  }

  const formData = new FormData(addressForm);
  const userAddress = {
    name: formData.get("name").trim(),
    address: formData.get("address").trim(),
    city: formData.get("city").trim(),
    state: formData.get("state").trim(),
    pincode: formData.get("pincode").trim(),
  };

  // Build message string
  let enquiryMessage = `Enquiry from: ${userAddress.name}\n`;
  enquiryMessage += `Address: ${userAddress.address}, ${userAddress.city}, ${userAddress.state} - ${userAddress.pincode}\n\n`;
  enquiryMessage += `Products Enquired:\n`;

  let grandTotal = 0;
  for (const key in cart) {
    const item = cart[key];
    const total = item.price * item.quantity;
    grandTotal += total;
    enquiryMessage += `- ${item.name} (${item.unit}) x ${item.quantity} = ₹${total}\n`;
  }
  enquiryMessage += `\nGrand Total: ₹${grandTotal}`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(enquiryMessage);

  // WhatsApp number - use international format without plus sign, here for India +91 9994376845 -> 919994376845
  const whatsappNumber = "919994376845";

  // WhatsApp URL
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Open WhatsApp in new tab/window
  window.open(whatsappURL, "_blank");

  // Reset everything
  cart = {};
  cartModal.classList.add("hidden");
  resetUI();
  addressForm.reset();
  updateCartButton();
});


// Render cart summary table inside modal
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

// Reset all checkboxes and qty inputs after enquiry
function resetUI() {
  // Uncheck all checkboxes and hide qty inputs, reset qty values
  document.querySelectorAll("input[type='checkbox']").forEach(chk => chk.checked = false);
  document.querySelectorAll("input[type='number']").forEach(qty => {
    qty.style.display = "none";
    qty.value = "1";
  });

  // Hide all product tables and reset toggle icons to '+'
  document.querySelectorAll(".product-table").forEach(table => (table.style.display = "none"));
  document.querySelectorAll(".category-header .toggle-icon").forEach(icon => (icon.textContent = "+"));
}
