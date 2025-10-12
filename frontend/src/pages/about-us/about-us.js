const applyBtn = document.getElementById('open-modal');
const applyModal = document.getElementById('apply-modal');
const closeApplyModal = document.getElementById('close-apply-modal');

if (applyBtn && applyModal) {
  applyBtn.addEventListener("click", (e) => {
    applyModal.showModal();
  });
}

if (closeApplyModal && applyModal) {
  closeApplyModal.addEventListener("click", () => {
    applyModal.close();
  });
}