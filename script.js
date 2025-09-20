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

// Render all categories and products
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

// Show Cart modal with summary and show Add Address button initially
viewCartBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }
  renderCartSummary();
  cartModal.classList.remove("hidden");
  showAddAddressBtn();
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

  // Validate form (HTML5 validation should handle this)
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

// Confirm enquiry button generates a PDF receipt and downloads it
confirmEnquiryBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }
  if (!addressData) {
    alert("Please add your address before generating the enquiry receipt.");
    return;
  }

  // Build the PDF content
  let pdfContent = `Enquiry from: ${addressData.name}\n`;
  pdfContent += `Address: ${addressData.address}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}\n\n`;
  pdfContent += `Products Enquired:\n`;

  let grandTotal = 0;
  for (const key in cart) {
    const item = cart[key];
    const total = item.price * item.quantity;
    grandTotal += total;
    pdfContent += `- ${item.name} (${item.unit}) x ${item.quantity} = ₹${total}\n`;
  }
  pdfContent += `\nGrand Total: ₹${grandTotal}`;

  // Create a new jsPDF document
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add the enquiry content to the PDF
  doc.text(pdfContent, 10, 10);

  // Save the PDF file automatically
  doc.save('enquiry_receipt.pdf');

  // Reset state and UI
  cart = {};
  addressData = null;
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

// Reset UI after enquiry submission
function resetUI() {
  document.querySelectorAll("input[type='checkbox']").forEach(chk => chk.checked = false);
  document.querySelectorAll("input[type='number']").forEach(qty => {
    qty.style.display = "none";
    qty.value = "1";
  });
  document.querySelectorAll(".product-table").forEach(table => (table.style.display = "none"));
  document.querySelectorAll(".category-header .toggle-icon").forEach(icon => (icon.textContent = "+"));

  // Remove Add Address button if present
  const addAddressBtn = document.getElementById("add-address-btn");
  if (addAddressBtn) addAddressBtn.remove();

  // Hide confirm enquiry button until address is added next time
  confirmEnquiryBtn.style.display = "none";
}