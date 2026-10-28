const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('.site-menu');

if (window.lucide?.createIcons) {
  window.lucide.createIcons();
}

const connectBlob = document.querySelector('.connect-blob');
if (connectBlob && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pointerFrame = 0;
  let scrollReset;
  let sectionTimer;
  let messageTimer;
  let giggleTimer;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let activeSectionIndex = 0;
  const sectionDwell = 24000;
  const sectionMessageDuration = 5200;
  const messageBubble = connectBlob.querySelector('.connect-message');
  const socialMessages = {
    WhatsApp: 'Need a quick reply? Send me a WhatsApp.',
    Instagram: 'Follow along on Instagram for more Ellis Software.',
    LinkedIn: 'Let’s connect professionally on LinkedIn.',
    GitHub: 'Curious about the code? Find me on GitHub.',
    Email: 'Have an idea? Send me an email anytime.',
    Phone: 'Prefer a call? You can reach me by phone.'
  };
  const mainContent = document.querySelector('main');
  const sectionTargets = mainContent
    ? Array.from(mainContent.children).filter((element) => element.tagName === 'SECTION')
    : [];
  const legalSectionTargets = sectionTargets.length
    ? []
    : Array.from(mainContent?.querySelectorAll('h2') || []);
  const targets = sectionTargets.length ? sectionTargets : legalSectionTargets;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getSectionMessage = (target, index) => {
    if (target.matches('.hero')) return 'Welcome! I build thoughtful things for the web.';
    if (target.matches('.work-section')) return 'A few recent projects I’m proud of.';
    if (target.matches('.approach-band')) return 'Thoughtful design, sturdy code.';
    if (target.matches('.closing')) return 'Find me on your favorite platform, or say hello directly.';
    if (target.matches('.contact-intro')) return 'Have an idea? Tell me what you’re thinking.';
    if (target.matches('.contact-form-section')) return 'A few details and we can get started.';
    if (target.matches('h2')) {
      const heading = target.textContent.trim().toLowerCase();
      if (heading.includes('privacy')) return 'Your privacy matters. Here’s how I handle it.';
      if (heading.includes('contact')) return 'Questions? I’m always happy to hear from you.';
      if (heading.includes('changes')) return 'I keep this page up to date.';
      if (heading.includes('cookies') || heading.includes('tracking')) return 'No intentional tracking on this site.';
      return 'A little more about ' + target.textContent.trim().toLowerCase() + '.';
    }

    return index === 0 ? 'Welcome! Take a look around.' : 'Here’s a little more about Ellis Software.';
  };

  const findCurrentSection = () => {
    if (!targets.length) return 0;
    const marker = window.innerHeight * 0.48;
    let closestIndex = 0;
    let closestDistance = Infinity;

    targets.forEach((target, index) => {
      const bounds = target.getBoundingClientRect();
      if (bounds.top <= marker && bounds.bottom >= marker) {
        closestIndex = index;
        closestDistance = 0;
        return;
      }

      const distance = Math.min(Math.abs(bounds.top - marker), Math.abs(bounds.bottom - marker));
      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    return closestIndex;
  };

  const showSectionMessage = (index) => {
    if (!messageBubble || !targets[index]) return;
    messageBubble.textContent = getSectionMessage(targets[index], index);
    connectBlob.classList.add('has-message');
    window.clearTimeout(messageTimer);
    messageTimer = window.setTimeout(() => {
      connectBlob.classList.remove('has-message');
    }, sectionMessageDuration);
  };

  document.querySelectorAll('.social-links .icon-link').forEach((link) => {
    const showSocialMessage = () => {
      const label = link.getAttribute('aria-label');
      const message = socialMessages[label];
      if (!messageBubble || !message) return;
      messageBubble.textContent = message;
      connectBlob.classList.add('has-message');
      window.clearTimeout(messageTimer);
      messageTimer = window.setTimeout(() => {
        connectBlob.classList.remove('has-message');
      }, sectionMessageDuration);
    };

    link.addEventListener('pointerenter', showSocialMessage);
    link.addEventListener('focus', showSocialMessage);
  });

  const placeBlobAtSection = (index) => {
    const bounds = connectBlob.getBoundingClientRect();
    const margin = window.innerWidth <= 600 ? 14 : 22;
    const target = targets[index];
    const targetBounds = target?.getBoundingClientRect();
    const header = document.querySelector('.site-header');
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const minY = Math.max(margin, headerBottom + 14);
    const maxY = Math.max(minY, window.innerHeight - bounds.height - margin);
    const targetCenter = targetBounds
      ? targetBounds.top + Math.min(targetBounds.height / 2, window.innerHeight * 0.32)
      : window.innerHeight - bounds.height - margin;
    const y = clamp(targetCenter - bounds.height / 2, minY, maxY);
    const side = index % 2 === 0 ? 'right' : 'left';
    const x = side === 'right' ? window.innerWidth - bounds.width - margin : margin;

    connectBlob.dataset.side = side;
    connectBlob.dataset.messagePosition = y < 112 ? 'below' : 'above';
    connectBlob.style.setProperty('--connect-x', `${Math.max(margin, x)}px`);
    connectBlob.style.setProperty('--connect-y', `${y}px`);
  };

  const moveToSection = (index, announce = true) => {
    if (!targets.length || connectBlob.matches(':hover') || connectBlob.matches(':focus-within')) return;
    activeSectionIndex = (index + targets.length) % targets.length;
    placeBlobAtSection(activeSectionIndex);
    if (announce) showSectionMessage(activeSectionIndex);
    scheduleSectionMove();
  };

  const scheduleSectionMove = () => {
    window.clearTimeout(sectionTimer);
    sectionTimer = window.setTimeout(() => {
      if (targets.length > 1) {
        if (connectBlob.matches(':hover') || connectBlob.matches(':focus-within')) {
          scheduleSectionMove();
          return;
        }
        moveToSection(activeSectionIndex + 1);
        connectBlob.classList.add('is-giggling');
      } else {
        scheduleSectionMove();
      }
    }, sectionDwell);
  };

  const scheduleGiggle = () => {
    window.clearTimeout(giggleTimer);
    giggleTimer = window.setTimeout(() => {
      connectBlob.classList.add('is-giggling');
      scheduleGiggle();
    }, 18000 + Math.random() * 12000);
  };

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
    moveToSection(findCurrentSection());
  });

  connectBlob.addEventListener('focusout', (event) => {
    if (!connectBlob.contains(event.relatedTarget)) moveToSection(findCurrentSection());
  });

  window.addEventListener('scroll', () => {
    window.clearTimeout(scrollReset);
    scrollReset = window.setTimeout(() => {
      const sectionIndex = findCurrentSection();
      if (sectionIndex !== activeSectionIndex) moveToSection(sectionIndex);
    }, 140);
  }, { passive: true });

  window.addEventListener('resize', () => placeBlobAtSection(activeSectionIndex), { passive: true });
  connectBlob.addEventListener('pointerenter', () => window.clearTimeout(sectionTimer));
  connectBlob.addEventListener('focusin', () => window.clearTimeout(sectionTimer));
  connectBlob.querySelector('.connect-blob-art')?.addEventListener('animationend', () => {
    connectBlob.classList.remove('is-giggling');
  });
  activeSectionIndex = findCurrentSection();
  placeBlobAtSection(activeSectionIndex);
  showSectionMessage(activeSectionIndex);
  scheduleSectionMove();
  scheduleGiggle();
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
