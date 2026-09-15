const navLinks = document.querySelectorAll(".navegacao-primaria a");

navLinks.forEach(link => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    // Remove "ativo" de todos os links
    navLinks.forEach(l => l.classList.remove("ativo"));

    // Adiciona "ativo" só no link clicado
    this.classList.add("ativo");

    // Scroll suave até a seção
    const targetId = this.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});