const authButtonsContainer = document.querySelector(".auth-buttons");
const cartContainer = document.querySelector(".cart-container");
const userAccount = document.querySelector(".user-account");
const userProfilePicture = document.getElementById("user-profile-img");

// const loadProfileImg = async (userId) => {
//   const res = await fetch(`http://localhost:3000/user/${userId}`, {
//     method: "GET"
//   })
  
//   const response = await res.json();
//   const profileImg = response.userAvatarUrl;
  
//   userProfilePicture.src = profileImg;
// }

(async function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (token) {
    if (authButtonsContainer) {
      authButtonsContainer.classList.add("hidden");
      cartContainer.classList.remove("hidden");
    }
    userAccount.classList.remove("hidden");
    
    const userNameElement = document.getElementById("username-menu");
    if (userNameElement && user.userName) {
      userNameElement.textContent = user.userName;
    }

    // const userId = user.userId;
    // loadProfileImg(userId);
  } else {
    authButtonsContainer.classList.remove("hidden");
    cartContainer.classList.add("hidden");
    userAccount.classList.add("hidden");
  }
})();