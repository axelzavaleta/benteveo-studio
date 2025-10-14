const cartProducts = document.getElementById("cart-products");

// localStorage.clear()

const getDataProducts = () => {
  const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
  
  return cartData;
}

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
  
  cartProducts.append(productCard) // insertando el nuevo producto a la lista
}

const showProducts = () => {
  const cart = getDataProducts();

  if (!cart.length > 0) {
    console.log("No existen productos en el carrito");
    
    return;
  }

  cart.forEach(game => {
    createProductCard(game);
  });
}

showProducts()