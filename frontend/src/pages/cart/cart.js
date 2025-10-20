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

const updatePurchaseSummary = (data) => {
  const { subtotal, taxValue, productsQuantity } = data;
  subtotalElement.textContent = subtotal;
  
  if (taxValue) {
    const totalPrice = subtotal + taxValue

    totalElement.textContent = totalPrice;
    return;
  }
  
  productsQuantityElement.textContent = productsQuantity;
  totalElement.textContent = subtotal;
}

const emptyCart = () => {
  localStorage.removeItem("cart");
  
  location.reload();
}

let subtotal = 0;
let productsQuantity = 0;

const createProductCard = (product) => {
  const productCard = document.createElement("article");
  productCard.classList.add("product-card");

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("product-img-container");

  const productImg = document.createElement("img");
  productImg.classList.add("product-img");
  productImg.src = "/src/assets/game.avif"

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

  cartProducts.append(productCard)

  subtotal += product.gamePrice
  productsQuantity++
  updatePurchaseSummary({ subtotal, productsQuantity })
}

const showProducts = () => {
  const cart = getDataProducts();

  if (!cart.length > 0) {
    const messageHeading = document.createElement("h1");
    messageHeading.textContent = "Tu carrito está vacío";
    messageHeading.classList.add("message-empty-card");

    const linkElement = document.createElement("a");
    linkElement.textContent = "Ir al catalogo";
    linkElement.classList.add("link-empty-cart"); 
    linkElement.href = "/src/pages/catalog/catalog.html";

    cartSummary.classList.add("hidden");

    cartProducts.append(messageHeading, linkElement);

    return;
  }

  cart.forEach(game => {
    createProductCard(game);
  });
}

showProducts()