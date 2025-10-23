const cartProducts = document.getElementById("cart-products");
const cartSummary = document.getElementById("cart-summary");
const subtotalElement = document.getElementById("subtotal-price");
const productsQuantityElement = document.getElementById("products-quantity");
const taxValueElement = document.getElementById("tax-value");
const totalElement = document.getElementById("total-price");

const getDataProducts = () => {
  const cartData = JSON.parse(localStorage.getItem("cart") || "[]");

  return cartData;
}


const calculateSummary = (cart) => {
  const subTotal = cart.reduce((accumulator, currentProduct) => accumulator += currentProduct.gamePrice, 0)
  const productsQuantity = cart.length;
  const taxValue = subTotal * (21 / 100); // Calculo del IVA. Solo para tener algo como impuesto xd
  const totalPrice = subTotal + taxValue;

  const summary = {
    subTotal, 
    taxValue,
    productsQuantity, 
    totalPrice, 
  }
  
  return summary;
}

const updatePurchaseSummary = (summary) => {
  const { subTotal, taxValue, productsQuantity, totalPrice } = summary;

  subtotalElement.textContent = subTotal;
  productsQuantityElement.textContent = productsQuantity;

  if (taxValue) {
    taxValueElement.textContent = taxValue;
    totalElement.textContent = totalPrice;
    return;
  }

  totalElement.textContent = totalPrice;
  taxValueElement.parentElement.textContent = "-";
}


const clearCart = () => {
  localStorage.removeItem("cart");
  renderCart();
}

const showEmptyCart = () => {
  cartProducts.innerHTML = "";
  cartSummary.classList.add("hidden");

  const messageHeading = document.createElement("h1");
  messageHeading.textContent = "Tu carrito está vacío";
  messageHeading.classList.add("message-empty-card");

  const linkElement = document.createElement("a");
  linkElement.textContent = "Ir al catalogo";
  linkElement.classList.add("link-empty-cart"); 
  linkElement.href = "/src/pages/catalog/catalog.html";

  cartProducts.append(messageHeading, linkElement);
}


const removeProduct = (productId) => {
  const cart = getDataProducts();
  const updatedCart = cart.filter((product, index) => index !== productId);

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  renderCart();
}

const createProductCard = (product, productId) => {
  const productCard = document.createElement("article");
  productCard.setAttribute("data-product-id", productId);
  productCard.classList.add("product-card");

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("product-img-container");

  const productImg = document.createElement("img");
  productImg.classList.add("product-img");
  productImg.src = product.gameImg || "/src/assets/game.avif";

  imgContainer.appendChild(productImg) // bloque 1: imagen

  const productCardInfo = document.createElement("div");
  productCardInfo.classList.add("product-card-info");

  const titleElement = document.createElement("h2");
  titleElement.classList.add("title-game");
  titleElement.textContent = product.gameTitle;

  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("tags");

  product.gameTags.forEach(tag => {
    const tagElement = document.createElement("span");
    tagElement.classList.add("tag-cart");
    tagElement.textContent = tag;

    tagsContainer.append(tagElement);
  });

  const priceContainer = document.createElement("p");
  priceContainer.textContent = "ARS $"

  const priceElement = document.createElement("span");
  priceElement.classList.add("product-price");
  priceElement.textContent = product.gamePrice;

  priceContainer.appendChild(priceElement);

  const removeBtnContainer = document.createElement("button");
  removeBtnContainer.classList.add("remove-product")

  removeBtnContainer.addEventListener("click", () => {
    removeProduct(productId);
  });

  const removeImg = document.createElement("img");
  removeImg.src = "/src/assets/trash.svg";
  removeImg.classList.add("w-5");

  removeBtnContainer.appendChild(removeImg);

  productCardInfo.append(
    titleElement,
    tagsContainer,
    priceContainer,
    removeBtnContainer
  ); // bloque 2: info

  productCard.append(imgContainer, productCardInfo);

  return productCard;
}

const renderCart = () => {
  const cart = getDataProducts();

  if (cart.length === 0) {
    showEmptyCart();
    return;
  }

  cartProducts.innerHTML = "";
  cartSummary.classList.remove("hidden");

  cart.forEach((product, ind) => {
    const productCard = createProductCard(product, ind);
    cartProducts.append(productCard);
  });

  const summary = calculateSummary(cart);
  updatePurchaseSummary(summary);
}

document.getElementById("clear-cart").addEventListener("click", clearCart);
renderCart();