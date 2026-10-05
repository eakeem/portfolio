const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('.site-menu');

if (window.lucide?.createIcons) {
  window.lucide.createIcons();
}

if (menuToggle && siteMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    siteMenu.classList.toggle('is-open', !isOpen);
  });

  siteMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      siteMenu.classList.remove('is-open');
    }
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((element) => observer.observe(element));
} else {
  revealItems.forEach((element) => element.classList.add('is-visible'));
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const recipient = contactForm.dataset.email;
    const subject = encodeURIComponent(`Portfolio inquiry from ${formData.get('name')}`);
    const body = encodeURIComponent(
      `Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\n\n${formData.get('project')}`
    );
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}
