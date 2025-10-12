const gameContainer = document.querySelector(".game-presentation");
const addToCartBtn = document.getElementById("add-to-cart");

// localStorage.clear()

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

addToCartBtn.addEventListener("click", () => {
  const gameData = getGameData(gameContainer);
  saveToCart(gameData)
})

