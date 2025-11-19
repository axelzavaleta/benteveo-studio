const authBtns = document.querySelectorAll(".auth-btn");
const closeModalBtns = document.querySelectorAll(".close-modal-btn");
const switchModalBtns = document.querySelectorAll(".back-to");
const toggleButtons = document.querySelectorAll('.toggle-password');

toggleButtons.forEach(toggleBtn => {
  toggleBtn.addEventListener('click', () => {
    const targetId = toggleBtn.getAttribute('data-target-modal');
    const inputPass = document.getElementById(targetId);
    const eyeClosed = toggleBtn.querySelector('.eye-closed');
    const eyeOpen = toggleBtn.querySelector('.eye-open');

    if (inputPass.type === 'password') {
      inputPass.type = 'text';
      eyeClosed.classList.add('hidden');
      eyeOpen.classList.remove('hidden');
      return;
    } 
    
    inputPass.type = 'password';
    eyeClosed.classList.remove('hidden');
    eyeOpen.classList.add('hidden');
  });
});

authBtns.forEach((authBtn) => {
  authBtn.addEventListener("click", (e) => {
    const modalId = e.target.dataset.targetModal;
    const currentModal = document.getElementById(modalId);

    currentModal.showModal();
  });
});

closeModalBtns.forEach((closeModalBtn) => {
  closeModalBtn.addEventListener("click", () => {
    const currentModal = closeModalBtn.closest(".modal-wrapper");

    currentModal.close();
  });
});

switchModalBtns.forEach((switchModalBtn) => {
  switchModalBtn.addEventListener("click", () => {
    const currentModal = switchModalBtn.closest(".modal-wrapper");
    const targetModalId = switchModalBtn.dataset.targetModal;
    const targetModal = document.getElementById(targetModalId);

    currentModal.close();
    targetModal.showModal();
  });
});