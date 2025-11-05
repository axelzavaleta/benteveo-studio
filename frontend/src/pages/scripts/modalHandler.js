const authBtns = document.querySelectorAll(".auth-btn");
const closeModalBtns = document.querySelectorAll(".close-modal-btn");
const switchModalBtns = document.querySelectorAll(".back-to");

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