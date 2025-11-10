const registerForm = document.getElementById("signup-modal");
const loginForm = document.getElementById("login-modal");
const userBtn = document.getElementById("user-btn");
const logoutBtn = document.querySelector("#logout-btn");

const pictureProfileInput = registerForm.querySelector("#profile-picture");
const pictureProfileImg = registerForm.querySelector("#profile-picture-img");

let dataImg = "";
pictureProfileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    const reader = new FileReader();

    reader.onload = (e) => {
      pictureProfileImg.src = e.target.result;
      dataImg = e.target.result;
    }

    reader.readAsDataURL(e.target.files[0]);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usernameInput = registerForm.querySelector("#username");
  const emailInput = registerForm.querySelector("#email-signup");
  const telephoneInput = registerForm.querySelector("#telephone-signup");
  const passwordInput = registerForm.querySelector("#password-signup");
  const repeatPasswordInput = registerForm.querySelector("#repeat-password-signup");
  
  const userName = usernameInput.value.trim();
  const userEmail = emailInput.value.trim();
  const userPhoneNumber = telephoneInput.value.trim();
  const userPassword = passwordInput.value;
  const repeatPassword = repeatPasswordInput.value;
  const userAvatarUrl = dataImg;

  const msgError = registerForm.querySelector("#message-error");
  const submitBtn = registerForm.querySelector("input[type='submit']")

  const displayError = (message, inputsError) => {
    msgError.textContent = message;
    submitBtn.setAttribute("disabled", true);

    inputsError.forEach(input => {
      input.classList.add("field-modal-error");
    });

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";

      inputsError.forEach(input => {
        input.classList.remove("field-modal-error");
      });
    }, 3000);
  };

  if (!userName || !userEmail || !userPassword) {
    displayError("Se deben rellenar los campos obligatorios.", [usernameInput, emailInput, passwordInput]);
    return;
  }

  if (userName.length < 4) {
    displayError("El nombre de usuario debe tener minimo 4 caracteres.", [usernameInput])
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    displayError("Formato de email invalido.", [emailInput])
    return;
  }

  if (userPhoneNumber) {
    if (!parseInt(userPhoneNumber)) {
      displayError("El campo telefono solo puede contener numeros.", [telephoneInput]);
      return;
    }
  }

  if (userPassword.length <= 4) {
    displayError("La contraseña debe tener mas 4 caracteres.", [passwordInput])
    return;
  }

  if (userPassword !== repeatPassword) {
    displayError("Las contraseñas no coinciden.", [passwordInput, repeatPasswordInput])
    return;
  }

  const userData = {
    userName,
    userEmail,
    userPassword,
    userPhoneNumber,
    userAvatarUrl,
  }

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })

    const response = await res.json();  

    if (!res.ok) {
      displayError(response.error);
      return;
    }

    const token = response.token;
    const user = response.publicUserData;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    usernameInput.value = "";
    emailInput.value = "";
    telephoneInput.value = "";
    passwordInput.value = "";
    repeatPasswordInput.value = "";
    submitBtn.setAttribute("disabled", true);

    msgError.classList.add("register-successfully")
    msgError.textContent = "Registro realizado con exito!!";

    setTimeout(() => {
      location.href = "/index";
    }, 2000);
  } catch (err) {
    console.error("Error de red:", err);
    msgError.textContent = "Error en la conexion. Intentalo mas tarde.";
  }
})

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector("#email-login");
  const passwordInput = loginForm.querySelector("#password-login");

  const userEmail = emailInput.value.trim();
  const userPassword = passwordInput.value;

  const msgError = loginForm.querySelector("#message-error");
  const submitBtn = loginForm.querySelector("input[type='submit']")

  const displayError = (message) => {
    msgError.textContent = message;
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
    }, 3000);
  };

  if (!userEmail || !userPassword) {
    displayError("Se deben rellenar todos los campos.")
    return;
  }

  if (userPassword.length <= 4) {
    displayError("La contraseña debe tener minimo 4 caracteres.")
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(userEmail)) {
    displayError("Formato de email invalido.")
    return;
  }

  const userData = {
    userEmail,
    userPassword,
  }

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })

    const response = await res.json();

    if (!res.ok) {
      displayError(response.error);
      return;
    }

    const token = response.token;
    const user = response.publicUserData;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.userStatus.userStatusName !== "activo") {
      displayError("Usuario suspendido!!")
      return;
    }

    let route = "/index";
    if (user.userRole.userRoleName === "admin") {
      route = "/src/pages/admin/admin.html";
    }

    emailInput.value = "";
    passwordInput.value = "";
    submitBtn.setAttribute("disabled", true);

    msgError.classList.add("login-successfully")
    msgError.textContent = "Inicio de sesion realizado con exito!!";

    setTimeout(() => {
      location.href = route;
    }, 2000);
  } catch (err) {
    console.error("Error de red:", err);
    msgError.textContent = "Error en la conexion. Intentalo mas tarde.";
  }
})


userBtn.addEventListener("click", () => {
  const userMenu = document.querySelector(".user-menu");
  userMenu.toggleAttribute("data-active");

  if (userMenu.hasAttribute("data-active")) {
    userMenu.classList.remove("hidden");
  } else {
    userMenu.classList.add("hidden");
  }
})

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "/index";
}

logoutBtn.addEventListener("click", logout);