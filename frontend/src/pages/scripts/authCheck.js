const updateUserInterface = (user) => {
  const userAccount = document.querySelector(".user-account");
  const userBtn = document.getElementById("user-btn");
  const usernameMenu = document.getElementById("username-menu");
  const authButtons = document.querySelector(".auth-buttons");
  const cartContainer = document.querySelector(".cart-container");
  
  if (userAccount && userBtn && usernameMenu) {
    if (authButtons) authButtons.classList.add("hidden");
    if (cartContainer) cartContainer.classList.remove("hidden");
    userAccount.classList.remove("hidden");
    
    usernameMenu.textContent = user.userName;

    const userImg = userBtn.querySelector("img");
    
    if (user.userAvatarUrl && user.userAvatarUrl !== "" && user.userAvatarUrl !== null) {
      
      const testImg = new Image();
      testImg.onload = function() {
        userImg.src = user.userAvatarUrl;
        userImg.alt = `${user.userName} avatar`;
        userImg.className = "w-full h-full rounded-full object-cover";
        userImg.style = "";
      };
      testImg.onerror = function() {
        userImg.src = "/src/assets/user.svg";
        userImg.alt = "user-logo";
        userImg.className = "w-8 h-8";
        userImg.style = "";
      };
      testImg.src = user.userAvatarUrl;
      
    } else {
      userImg.src = "/src/assets/user.svg";
      userImg.alt = "user-logo";
      userImg.className = "w-8 h-8";
      userImg.style = "";
    }
  }
}

const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      updateUserInterface(user);
    } catch (error) {
      showAuthButtons();
    }
  } else {
    showAuthButtons();
  }
}

const showAuthButtons = () => {
  const authButtons = document.querySelector(".auth-buttons");
  const cartContainer = document.querySelector(".cart-container");
  const userAccount = document.querySelector(".user-account");
  
  if (authButtons) authButtons.classList.remove("hidden");
  if (cartContainer) cartContainer.classList.add("hidden");
  if (userAccount) userAccount.classList.add("hidden");
}

window.updateUserInterface = updateUserInterface;

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});