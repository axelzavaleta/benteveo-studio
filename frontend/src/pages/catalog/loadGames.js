function renderProducts(products) {
  const gamesWrapper = document.querySelector(".games-wrapper");

  products.forEach(product => {
    const { productId, productCatalogImageUrl, productName, productPrice } = product;

    gamesWrapper.innerHTML += `
      <a href="/src/pages/games/game.html?id=${productId}" class="game-card" data-game-card-id="${productId}">
        <div class="game-img" style="background-image: url('${productCatalogImageUrl || "/src/assets/default.png"}')"></div>
        
        <div class="game-info">
          <h2 class="game-info-title no-translate">${productName}</h2>
          <p class="game-price-container">ARS $<span class="game-price">${productPrice}</span></p>
        </div>
      </a>
    `;
  });
}

const loadGames = async () => {
  try {
    const response = await fetch(`http://localhost:3000/product`, {
      method: "GET",
      headers: { 
        "Content-Type": "Application/json"
      }
    })
    const products = await response.json();

    renderProducts(products);
  } catch (error) {
    console.log("Error al cargar los productos", error.message);
  }
}

loadGames();