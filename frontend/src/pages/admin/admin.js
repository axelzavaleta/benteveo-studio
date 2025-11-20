// --- NAVEGACIÓN ENTRE TABS ---
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    switchToTab(this.getAttribute('data-tab'));
  });
});

function switchToTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    content.classList.add('hidden');
  });

  const tabContent = document.getElementById(tabId);
  tabContent.classList.remove('hidden');
  tabContent.classList.add('active');

  const pageTitle = document.getElementById('pageTitle');
  const tabTitles = { 'welcome': 'Inicio', 'games': 'Juegos', 'users': 'Usuarios' };
  pageTitle.textContent = tabTitles[tabId];
}

// ================= CONFIGURACIÓN BÁSICA DE MODALES =================
const productModal = document.getElementById('newProductModal');
const userModal = document.getElementById('newUserModal');

// Configuración básica del modal de productos
if (productModal) {
  const closeProductModal = document.getElementById('closeProductModal');
  const cancelProductModal = document.getElementById('cancelProductModal');

  function closeProductModalFunc() {
    productModal.close();
  }

  if (closeProductModal) {
    closeProductModal.addEventListener('click', closeProductModalFunc);
  }
  if (cancelProductModal) {
    cancelProductModal.addEventListener('click', closeProductModalFunc);
  }

  productModal.addEventListener('click', (e) => {
    const rect = productModal.getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top || e.clientY > rect.bottom
    ) closeProductModalFunc();
  });
}

// Configuración básica del modal de usuarios
if (userModal) {
  const closeUserModal = document.getElementById('closeUserModal');
  const cancelUserModal = document.getElementById('cancelUserModal');

  function closeUserModalFunc() {
    if (userModal) {
      userModal.close();
    }
  }

  if (closeUserModal) closeUserModal.addEventListener('click', closeUserModalFunc);
  if (cancelUserModal) cancelUserModal.addEventListener('click', closeUserModalFunc);

  if (userModal) {
    userModal.addEventListener('click', (e) => {
      const rect = userModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)
        closeUserModalFunc();
    });
  }
}

// ================= COMPRESIÓN DE IMÁGENES =================
const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleAvatarImage = async (e, previewId) => {
  const file = e.target.files[0];

  if (!file) return null;

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert("Formato de imagen no válido.");
    e.target.value = '';
    return null;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("La imagen es demasiado grande. Usa una imagen más pequeña.");
    e.target.value = '';
    return null;
  }

  try {
    const compressedImage = await compressImage(file);
    
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.innerHTML = `<img src="${compressedImage}" class="w-24 h-24 rounded-full object-cover border border-gray-600">`;
    }
    
    return compressedImage;
  } catch (error) {
    console.error("Error procesando imagen:", error);
    alert("Error al procesar la imagen");
    e.target.value = '';
    return null;
  }
}

// ================= USERS (USUARIOS) - SOLO UI =================
const openUserModalBtn = document.getElementById('openUserModal');
const userForm = document.getElementById('newUserForm');
const avatarFile = document.getElementById('avatarFile');
const avatarPreview = document.getElementById('avatarPreview');

// Variables globales para los avatares comprimidos
window.avatarComprimido = "";
window.editAvatarComprimido = "";

if (userModal) userModal.style.display = "none";

// Solo manejar la apertura del modal y UI básica
if (openUserModalBtn) {
  openUserModalBtn.addEventListener('click', () => {
    if (userForm) userForm.reset();
    window.avatarComprimido = "";
    if (avatarPreview) avatarPreview.innerHTML = "";
    if (userModal) {
      userModal.showModal();
      userModal.style.display = "flex";
    }
  });
}

// ================= AVATAR PARA NUEVO USUARIO =================
if (avatarFile) {
  avatarFile.addEventListener('change', async (e) => {
    window.avatarComprimido = await handleAvatarImage(e, 'avatarPreview');
  });
}

// ================= AVATAR PARA EDICIÓN =================
const editAvatarFile = document.getElementById('editAvatarFile');
const editAvatarPreview = document.getElementById('editAvatarPreview');

if (editAvatarFile) {
  editAvatarFile.addEventListener('change', async (e) => {
    window.editAvatarComprimido = await handleAvatarImage(e, 'editAvatarPreview');
  });
}

// ================= MODALES DE ELIMINACIÓN =================
const deleteModalUserElem = document.getElementById('confirmDelete_ModalUser');
const cancelDeleteBtnUser = document.getElementById('cancelDelete_BtnUser');
const closeDeleteModalUserBtn = document.getElementById('closeDeleteModalUser');

if (cancelDeleteBtnUser) {
  cancelDeleteBtnUser.addEventListener('click', () => {
    if (deleteModalUserElem) deleteModalUserElem.close();
  });
}
if (closeDeleteModalUserBtn) {
  closeDeleteModalUserBtn.addEventListener('click', () => {
    if (deleteModalUserElem) deleteModalUserElem.close();
  });
}

// Modal de eliminación general (para productos)
const deleteModal = document.getElementById('confirmDelete_Modal');
const cancelDeleteBtn = document.getElementById('cancelDelete_Btn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModal');

if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener('click', () => {
    if (deleteModal) deleteModal.close();
  });
}
if (closeDeleteModalBtn) {
  closeDeleteModalBtn.addEventListener('click', () => {
    if (deleteModal) deleteModal.close();
  });
}