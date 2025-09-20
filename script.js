const container = document.getElementById("product-container");
const viewCartBtn = document.getElementById("view-cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartSummary = document.getElementById("cart-summary");
const closeCartBtn = document.getElementById("close-cart-btn");
const confirmEnquiryBtn = document.getElementById("confirm-enquiry-btn");

const addressForm = document.getElementById("address-form");
const addressModal = document.getElementById("address-modal");
const cancelAddressBtn = document.getElementById("cancel-address-btn");


let cart = {};
let addressData = null;

// Helper: update cart button state
function updateCartButton() {
  const hasItems = Object.keys(cart).length > 0;
  viewCartBtn.disabled = !hasItems;
}

// Render cart summary inside modal
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

// Show Cart modal with summary and show Add Address button initially
viewCartBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }
  renderCartSummary();
  cartModal.classList.remove("hidden");
  showAddAddressBtn(); // This ensures Add Address button appears
});

// Close Cart modal
closeCartBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

// Cancel Address modal
cancelAddressBtn.addEventListener("click", () => {
  addressModal.classList.add("hidden");
  cartModal.classList.remove("hidden");
});

// Address form submit: save address data, close modal, show Send Enquiry button
addressForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!addressForm.reportValidity()) return;

  const formData = new FormData(addressForm);
  addressData = {
    name: formData.get("name").trim(),
    address: formData.get("address").trim(),
    city: formData.get("city").trim(),
    state: formData.get("state").trim(),
    pincode: formData.get("pincode").trim(),
  };

  addressModal.classList.add("hidden");
  cartModal.classList.remove("hidden");
  showConfirmEnquiryBtn();
});

// Show Add Address button, hide Send Enquiry button
function showAddAddressBtn() {
  confirmEnquiryBtn.style.display = "none";
  let addAddressBtn = document.getElementById("add-address-btn");
  if (!addAddressBtn) {
    addAddressBtn = document.createElement("button");
    addAddressBtn.id = "add-address-btn";
    addAddressBtn.textContent = "Add Address";
    addAddressBtn.className = "primary";
    addAddressBtn.style.marginLeft = "0.5rem";
    confirmEnquiryBtn.parentNode.appendChild(addAddressBtn);

    addAddressBtn.addEventListener("click", () => {
      cartModal.classList.add("hidden");
      addressModal.classList.remove("hidden");
    });
  } else {
    addAddressBtn.style.display = "inline-block";
  }
}

// Show Send Enquiry button, hide Add Address button
function showConfirmEnquiryBtn() {
  confirmEnquiryBtn.style.display = "inline-block";
  const addAddressBtn = document.getElementById("add-address-btn");
  if (addAddressBtn) addAddressBtn.style.display = "none";
}

// Confirm enquiry button sends WhatsApp message with cart + address
confirmEnquiryBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }
  if (!addressData) {
    alert("Please add your address before sending enquiry.");
    return;
  }

  // Build enquiry message
  let enquiryMessage = `Enquiry from: ${addressData.name}\n`;
  enquiryMessage += `Address: ${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}\n\n`;
  enquiryMessage += `Products Enquired:\n`;

  let grandTotal = 0;
  for (const key in cart) {
    const item = cart[key];
    const total = item.price * item.quantity;
    grandTotal += total;
    enquiryMessage += `- ${item.name} (${item.unit}) x ${item.quantity} = ₹${total}\n`;
  }
  enquiryMessage += `\nGrand Total: ₹${grandTotal}`;

  // Encode message for WhatsApp URL
  const encodedMessage = encodeURIComponent(enquiryMessage);
  const whatsappNumber = "919994376845";  // Replace with correct number
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Fallback email
  const emailSubject = "Enquiry for Firecrackers";
  const emailBody = encodeURIComponent(enquiryMessage);
  const emailURL = `mailto:info@vishcrackers.com?subject=${emailSubject}&body=${emailBody}`; // Replace with correct email

  // Try to open WhatsApp
  const whatsappWindow = window.open(whatsappURL, "_blank");

  // If WhatsApp window didn't open (i.e., it was blocked), attempt to open the email client
  if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
    const emailWindow = window.open(emailURL, "_blank");

    // If the email client also fails (i.e., both options fail), show a fallback message
    if (!emailWindow || emailWindow.closed || typeof emailWindow.closed === 'undefined') {
      alert("Both WhatsApp and Email options failed. Please contact us directly at info@vishcrackers.com.");
    }
  }

  // Reset cart and address data (optional, depending on requirements)
  cart = {};
  addressData = null;
  
  // Reset UI after enquiry (re-enable view cart button)
  resetUI();
});


// Render product categories
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
        if (isNaN(val) || val <= 0) {
          qtyInput.value = 1;
        }
        cart[item.name].quantity = val;
      }
    });

    tbody.appendChild(row);
  });

  // Category toggle
  header.addEventListener("click", () => {
    const toggleIcon = header.querySelector(".toggle-icon");
    const isVisible = table.style.display === "table";
    toggleIcon.textContent = isVisible ? "+" : "-";
    table.style.display = isVisible ? "none" : "table";
  });

  categoryDiv.appendChild(header);
  categoryDiv.appendChild(table);
  container.appendChild(categoryDiv);
});

// Reset UI (cart, etc.)
function resetUI() {
  updateCartButton();
  cartModal.classList.add("hidden");
  addressModal.classList.add("hidden");
  confirmEnquiryBtn.style.display = "none";
  const addAddressBtn = document.getElementById("add-address-btn");
  if (addAddressBtn) addAddressBtn.style.display = "none";
}