const gameContainer = document.querySelector(".game-presentation");
const addToCartBtn = document.getElementById("add-to-cart");
const toastContainer = document.getElementById("toast");
const toastTitle = document.getElementById("toast-title");
const toastIcon = document.getElementById("toast-icon");
const toastContent = document.getElementById("toast-content");

const getGameData = (container) => {
  const tags = container.querySelectorAll(".game-tag");

  const gameTags = [];
  tags.forEach(tag => {
    gameTags.push(tag.textContent);
  })

  return {
    gameTitle: container.querySelector("#game-title").textContent,
    gamePrice: parseInt(container.querySelector("#game-price").textContent),
    gameTags: gameTags,
    gameImg: "/src/assets/incognita-logo-grande.png",
  }
}

const saveToCart = (game) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart.push(game);

  localStorage.setItem("cart", JSON.stringify(cart));
}

const showToast = (status, title, content) => {
  status === "error"
  ? toastIcon.src = "/src/assets/error-circle.svg"
  : toastIcon.src = "/src/assets/check-circle.svg";
  
  toastContainer.classList.add(status);
  toastContainer.classList.add("show");
  toastTitle.textContent = title;
  toastContent.textContent = content;
  
  setTimeout(() => {
    addToCartBtn.removeAttribute("disabled");
    toastContainer.classList.remove("success", "error");
    toastContainer.classList.remove("show");
  }, 3000);
}

addToCartBtn.addEventListener("click", () => {
  const isLogged = localStorage.getItem("token");
  toastContainer.classList.remove("hidden");
  addToCartBtn.setAttribute("disabled", true);

  if (!isLogged) {
    return showToast("error", "Error", "Inicie sesion para administrar su carrito");
  }
  
  showToast("success", "Exito", "Se ha añadido el producto correctamente al carrito");
  
  const gameData = getGameData(gameContainer);
  saveToCart(gameData);
})

