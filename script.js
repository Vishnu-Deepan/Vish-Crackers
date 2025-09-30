let currentPage = 1;
const itemsPerPage = 10;
let selectedCategory = 'all'; // Default to show all categories

// Get reference to the category select element
const categorySelect = document.getElementById('category-select');

function populateCategories(data) {
  // Populate the category dropdown dynamically based on the categories in productsData
  const categories = data.map(item => item.category);
  const uniqueCategories = [...new Set(categories), 'all']; // Add 'all' option to view all categories
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function displayProducts(data) {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = '';

  let filteredData = data;
  
  if (selectedCategory !== 'all') {
    // Filter products based on the selected category
    filteredData = data.filter(category => category.category === selectedCategory);
  }

  filteredData.forEach(category => {
    const categorySection = document.createElement('section');
    
    const categoryTitle = document.createElement('h2');
    categoryTitle.classList.add('category-title');
    categoryTitle.textContent = category.category;
    categorySection.appendChild(categoryTitle);

    const productGrid = document.createElement('div');
    productGrid.classList.add('product-grid');
    
    // Slice the category's items to paginate them
    category.items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).forEach(item => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');

      const productImage = document.createElement('img');
      productImage.src = 'assets/placeholder.jpg';
      productCard.appendChild(productImage);

      const productContent = document.createElement('div');
      productContent.classList.add('product-card-content');

      const productName = document.createElement('div');
      productName.classList.add('product-name');
      productName.textContent = item.name;
      productContent.appendChild(productName);

      const productPrice = document.createElement('div');
      productPrice.classList.add('product-price');
      productPrice.textContent = `$${item.price.toFixed(2)}`;
      productContent.appendChild(productPrice);

      const originalPrice = document.createElement('div');
      originalPrice.classList.add('product-original-price');
      originalPrice.textContent = `$${item.originalPrice.toFixed(2)}`;
      productContent.appendChild(originalPrice);

      const productUnit = document.createElement('div');
      productUnit.classList.add('product-unit');
      productUnit.textContent = item.unit;
      productContent.appendChild(productUnit);

      productCard.appendChild(productContent);
      productGrid.appendChild(productCard);
    });

    categorySection.appendChild(productGrid);
    productsContainer.appendChild(categorySection);
  });

  generatePagination(filteredData);
}

function generatePagination(data) {
  const pagination = document.getElementById('pagination');
  const totalItems = data.reduce((acc, category) => acc + category.items.length, 0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  pagination.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayProducts(data);
    });
    pagination.appendChild(pageButton);
  }
}

categorySelect.addEventListener('change', (e) => {
  selectedCategory = e.target.value;
  currentPage = 1; // Reset to first page when category changes
  displayProducts(productsData);
});

window.onload = function() {
  populateCategories(productsData); // Populate category filter
  displayProducts(productsData);
};

