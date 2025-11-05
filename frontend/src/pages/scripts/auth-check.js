const authButtonsContainer = document.querySelector(".auth-buttons");
const cartContainer = document.querySelector(".cart-container");
const userAccount = document.querySelector(".user-account");

(function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (token) {
    authButtonsContainer.classList.add("hidden");
    cartContainer.classList.remove("hidden");
    userAccount.classList.remove("hidden");
    
    const userNameElement = document.getElementById("username-menu");

    if (userNameElement && user.userName) {
      userNameElement.textContent = user.userName;
    }
  } else {
    authButtonsContainer.classList.remove("hidden");
    cartContainer.classList.add("hidden");
    userAccount.classList.add("hidden");
  }
})();