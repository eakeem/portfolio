const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('.site-menu');

if (window.lucide?.createIcons) {
  window.lucide.createIcons();
}

const connectBlob = document.querySelector('.connect-blob');
if (connectBlob && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pointerFrame = 0;
  let scrollReset;
  let previousScrollY = window.scrollY;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateBlobTracking = () => {
    const bounds = connectBlob.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const dx = pointerX - centerX;
    const dy = pointerY - centerY;

    const lookX = clamp(dx / 28, -5, 5);
    const lookY = clamp(dy / 22, -4, 4);
    const tilt = clamp(dx / 28, -14, 14);

    connectBlob.style.setProperty('--connect-tilt', `${tilt * 0.8}deg`);
    connectBlob.style.setProperty('--connect-look-x', `${lookX}px`);
    connectBlob.style.setProperty('--connect-look-y', `${lookY}px`);
  };

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerFrame) return;

    pointerFrame = window.requestAnimationFrame(() => {
      updateBlobTracking();
      pointerFrame = 0;
    });
  }, { passive: true });

  connectBlob.addEventListener('pointerleave', () => {
    connectBlob.style.setProperty('--connect-look-x', '0px');
    connectBlob.style.setProperty('--connect-look-y', '0px');
    connectBlob.style.setProperty('--connect-tilt', '0deg');
  });

  window.addEventListener('scroll', () => {
    const scrollDelta = window.scrollY - previousScrollY;
    previousScrollY = window.scrollY;
    const shift = Math.max(-7, Math.min(7, scrollDelta * 0.18));
    connectBlob.style.setProperty('--connect-scroll-shift', `${shift}px`);
    window.clearTimeout(scrollReset);
    scrollReset = window.setTimeout(() => {
      connectBlob.style.setProperty('--connect-scroll-shift', '0px');
    }, 100);
  }, { passive: true });

  updateBlobTracking();
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
