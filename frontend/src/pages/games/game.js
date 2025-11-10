const gameContainer = document.querySelector(".game-presentation");
const addToCartBtn = document.getElementById("add-to-cart");
const notificationContainer = document.getElementById("notification");
const notificationTitle = document.getElementById("notification-title");
const notificationIcon = document.getElementById("notification-icon");
const notificationContent = document.getElementById("notification-content");

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
    gameImg: container.querySelector("#game-img").src,
  }
}

const saveToCart = (game) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart.push(game);

  localStorage.setItem("cart", JSON.stringify(cart));
}

const showNotification = (status, title, content) => {
  (status === "error")
    ? notificationIcon.src = "/src/assets/error-circle.svg"
    : notificationIcon.src = "/src/assets/check-circle.svg";

  notificationContainer.classList.add(status);
  notificationTitle.textContent = title;
  notificationContent.textContent = content;
  
  setTimeout(() => {
    addToCartBtn.removeAttribute("disabled");
    notificationContainer.classList.remove("success", "error");
    notificationContainer.classList.add("hidden");
  }, 3000);
}

addToCartBtn.addEventListener("click", () => {
  const isLogged = localStorage.getItem("token");
  notificationContainer.classList.remove("hidden");
  addToCartBtn.setAttribute("disabled", true);

  if (!isLogged) {
    return showNotification("error", "Error", "Inicie sesion para administrar su carrito");
  }
  
  showNotification("success", "Exito", "Se ha añadido el producto correctamente al carrito");
  
  const gameData = getGameData(gameContainer);
  saveToCart(gameData);
})

