document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const answer = item.querySelector(".faq-answer");
    const icon = btn.querySelector("span:last-child");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      if (faq !== item) {
        faq.querySelector(".faq-answer").style.maxHeight = null;
        faq.querySelector(".faq-question span:last-child").style.transform = "rotate(0deg)";
      }
    });

    if (answer.style.maxHeight) {
      answer.style.maxHeight = null;
      icon.style.transform = "rotate(0deg)";
    } else {
      answer.style.maxHeight = answer.scrollHeight + "px";
      icon.style.transform = "rotate(90deg)";
    }
  });
});
  