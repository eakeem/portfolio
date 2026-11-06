const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.querySelector('.site-menu');

if (window.lucide?.createIcons) {
  window.lucide.createIcons();
}

const connectBlob = document.querySelector('.connect-blob');
const gamesSection = document.querySelector('#games');
if (connectBlob && gamesSection && 'IntersectionObserver' in window) {
  const gamesObserver = new IntersectionObserver(([entry]) => {
    connectBlob.classList.toggle('is-hidden-over-games', entry.isIntersecting);
  }, { threshold: 0.12 });
  gamesObserver.observe(gamesSection);
}

if (connectBlob && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pointerFrame = 0;
  let scrollReset;
  let sectionTimer;
  let messageTimer;
  let giggleTimer;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let activeSectionIndex = 0;
  const sectionDwell = 30000;
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

  const showSectionMessage = (index, message) => {
    if (!messageBubble || (!targets[index] && !message)) return;
    messageBubble.textContent = message || getSectionMessage(targets[index], index);
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
        const nextIndex = (activeSectionIndex + 1) % targets.length;
        moveToSection(nextIndex);
        if (Math.random() < 0.45) {
          connectBlob.classList.add('is-giggling');
        }
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
    }, 20000 + Math.random() * 15000);
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
    connectBlob.style.setProperty('--connect-fluid-x', `${clamp(dx / 180, -1, 1)}`);
    connectBlob.style.setProperty('--connect-fluid-y', `${clamp(dy / 140, -1, 1)}`);
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
    connectBlob.style.setProperty('--connect-fluid-x', '0');
    connectBlob.style.setProperty('--connect-fluid-y', '0');
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
  showSectionMessage(activeSectionIndex, "Hi, I'm Connect! I'll be your personal navigator.");
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

const pongCanvas = document.querySelector('[data-pong-canvas]');
const pongStartButton = document.querySelector('[data-pong-start]');
const pongResetButton = document.querySelector('[data-pong-reset]');
const pongStatus = document.querySelector('[data-pong-status]');
const pongDialog = document.querySelector('[data-pong-dialog]');
const pongOpenButton = document.querySelector('[data-pong-open]');
const pongCloseButton = document.querySelector('[data-pong-close]');

if (pongCanvas && pongStartButton && pongResetButton && pongStatus && pongDialog && pongOpenButton && pongCloseButton) {
  const context = pongCanvas.getContext('2d');
  const playerScoreElement = document.querySelector('[data-pong-player-score]');
  const cpuScoreElement = document.querySelector('[data-pong-cpu-score]');
  const cpuCountryElement = document.querySelector('[data-pong-cpu-country]');
  const cpuSwatchElement = document.querySelector('[data-pong-cpu-swatch]');
  const paddleSlider = document.querySelector('[data-pong-paddle-slider]');
  const countrySelect = document.querySelector('[data-pong-country]');
  const roundsSelect = document.querySelector('[data-pong-rounds]');
  const settingsFieldset = document.querySelector('[data-pong-settings]');
  const courtWidth = 800;
  const courtHeight = 450;
  const paddleWidth = 12;
  const paddleHeight = 82;
  const ballRadius = 9;
  const powerupDuration = 6500;
  const isMobileCourt = () => window.matchMedia('(max-width: 600px)').matches;
  const countryColors = {
    jamaica: ['#009b3a', '#fcd116', '#111111', '#fcd116', '#009b3a'],
    usa: ['#b22234', '#ffffff', '#3c3b6e', '#ffffff', '#b22234'],
    brazil: ['#009739', '#ffdf00', '#009739'],
    france: ['#0055a4', '#ffffff', '#ef4135'],
    japan: ['#ffffff', '#bc002d', '#ffffff'],
    canada: ['#d80621', '#ffffff', '#d80621'],
    argentina: ['#75aadb', '#ffffff', '#75aadb'],
    germany: ['#111111', '#dd0000', '#ffce00']
  };
  const countryNames = {
    jamaica: 'Jamaica',
    usa: 'USA',
    brazil: 'Brazil',
    france: 'France',
    japan: 'Japan',
    canada: 'Canada',
    argentina: 'Argentina',
    germany: 'Germany'
  };
  const powerups = {
    fire: { label: 'F', name: 'Fire', color: '#f97316' },
    ice: { label: 'I', name: 'Ice', color: '#38bdf8' },
    lightning: { label: 'L', name: 'Lightning', color: '#facc15' },
    boost: { label: '+', name: 'Paddle boost', color: '#a78bfa' },
    twin: { label: '2', name: 'Twin paddles', color: '#34d399' }
  };
  const player = { x: 25, y: courtHeight / 2 };
  const cpu = { x: courtWidth - 25 - paddleWidth, y: courtHeight / 2 };
  let balls = [{ x: courtWidth / 2, y: courtHeight / 2, vx: 5, vy: 2 }];
  let playerScore = 0;
  let cpuScore = 0;
  let roundsToWin = Number(roundsSelect?.value) || 5;
  let playerColors = countryColors[countrySelect?.value] || countryColors.jamaica;
  let cpuCountry = 'usa';
  let cpuColors = countryColors[cpuCountry];
  let active = false;
  let finished = false;
  let animationFrame = 0;
  let previousFrame = 0;
  let powerupDrop = null;
  let nextPowerupAt = performance.now() + 3000;
  let cpuFrozenUntil = 0;
  let playerBoostUntil = 0;
  let twinPaddlesUntil = 0;
  let lightningUntil = 0;
  let lightningActive = false;

  const clampPaddle = (paddle) => {
    const height = paddle.height || paddleHeight;
    paddle.y = Math.max(height / 2, Math.min(courtHeight - height / 2, paddle.y));
  };

  const setPlayerPosition = (y) => {
    player.y = y;
    clampPaddle(player);
    if (paddleSlider) {
      paddleSlider.value = String(Math.round((1 - player.y / courtHeight) * 1000));
    }
  };

  const resetPowerups = () => {
    powerupDrop = null;
    nextPowerupAt = performance.now() + 3000;
    cpuFrozenUntil = 0;
    playerBoostUntil = 0;
    twinPaddlesUntil = 0;
    lightningUntil = 0;
    lightningActive = false;
  };

  const setSettingsLocked = (locked) => {
    if (settingsFieldset) settingsFieldset.disabled = locked;
  };

  const randomizeCpuCountry = () => {
    const availableCountries = Object.keys(countryColors).filter((country) => country !== countrySelect?.value);
    cpuCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)] || 'usa';
    cpuColors = countryColors[cpuCountry];
    if (cpuCountryElement) cpuCountryElement.textContent = countryNames[cpuCountry];
    if (cpuSwatchElement) cpuSwatchElement.style.background = `linear-gradient(90deg, ${cpuColors.join(', ')})`;
  };

  const resizeCanvas = () => {
    const bounds = pongCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    pongCanvas.width = Math.round(bounds.width * pixelRatio);
    pongCanvas.height = Math.round(bounds.height * pixelRatio);
    draw();
  };

  const drawPaddle = (paddle, colors, height) => {
    const palette = Array.isArray(colors) ? colors : [colors];
    const paddleHeightNow = height || paddleHeight;
    const top = paddle.y - paddleHeightNow / 2;
    context.save();
    context.beginPath();
    context.rect(paddle.x, top, paddleWidth, paddleHeightNow);
    context.clip();
    context.shadowColor = palette[0];
    context.shadowBlur = 14;
    const stripeHeight = paddleHeightNow / palette.length;
    palette.forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect(paddle.x - 3, top + stripeHeight * index, paddleWidth + 6, stripeHeight + 1);
    });
    context.restore();
  };

  const draw = () => {
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
    if (isMobileCourt()) {
      context.setTransform(0, pongCanvas.height / courtWidth, -pongCanvas.width / courtHeight, 0, pongCanvas.width, 0);
    } else {
      context.setTransform(pongCanvas.width / courtWidth, 0, 0, pongCanvas.height / courtHeight, 0, 0);
    }
    context.fillStyle = '#10152f';
    context.fillRect(0, 0, courtWidth, courtHeight);
    context.strokeStyle = 'rgba(255,255,255,.2)';
    context.lineWidth = 3;
    context.setLineDash([10, 12]);
    context.beginPath();
    context.moveTo(courtWidth / 2, 18);
    context.lineTo(courtWidth / 2, courtHeight - 18);
    context.stroke();
    context.setLineDash([]);
    const now = performance.now();
    const playerHeight = now < playerBoostUntil ? paddleHeight * 1.55 : paddleHeight;
    drawPaddle(player, playerColors, playerHeight);
    if (now < twinPaddlesUntil) {
      const secondY = player.y < courtHeight / 2
        ? Math.min(player.y + 104, courtHeight - paddleHeight / 2)
        : Math.max(player.y - 104, paddleHeight / 2);
      drawPaddle({ x: player.x + 18, y: secondY }, playerColors, paddleHeight * .82);
    }
    drawPaddle(cpu, now < cpuFrozenUntil ? ['#dff8ff', '#38bdf8', '#dff8ff'] : cpuColors);
    if (now < cpuFrozenUntil) {
      context.fillStyle = '#b9efff';
      context.font = '700 12px DM Sans, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('FROZEN', cpu.x + paddleWidth / 2, cpu.y - paddleHeight / 2 - 13);
    }
    balls.forEach((ball) => {
      context.beginPath();
      context.fillStyle = '#fffdf8';
      context.shadowColor = '#fffdf8';
      context.shadowBlur = 16;
      context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      context.fill();
    });
    context.shadowBlur = 0;

    if (powerupDrop) {
      const powerup = powerups[powerupDrop.type];
      context.beginPath();
      context.fillStyle = powerup.color;
      context.shadowColor = powerup.color;
      context.shadowBlur = 22;
      context.arc(powerupDrop.x, powerupDrop.y, 16, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = '#10152f';
      context.font = '700 15px DM Sans, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(powerup.label, powerupDrop.x, powerupDrop.y + 1);
    }

    if (!active) {
      context.fillStyle = 'rgba(16,21,47,.52)';
      context.fillRect(0, 0, courtWidth, courtHeight);
      context.fillStyle = '#fffdf8';
      context.font = '600 23px DM Sans, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const message = finished ? (playerScore >= roundsToWin ? 'YOU WIN!' : 'CPU WINS') : 'PONG';
      if (isMobileCourt()) {
        context.save();
        context.translate(courtWidth / 2, courtHeight / 2);
        context.rotate(-Math.PI / 2);
        context.fillText(message, 0, 0);
        context.restore();
      } else {
        context.fillText(message, courtWidth / 2, courtHeight / 2);
      }
    }
  };

  const updateScore = () => {
    if (playerScoreElement) playerScoreElement.textContent = String(playerScore);
    if (cpuScoreElement) cpuScoreElement.textContent = String(cpuScore);
  };

  const serveBall = (direction) => {
    balls = [{
      x: courtWidth / 2,
      y: courtHeight / 2,
      vx: 5 * direction,
      vy: Math.random() < .5 ? -2 : 2
    }];
  };

  const finishPoint = (scorer) => {
    if (scorer === 'player') {
      playerScore += 1;
      pongStatus.textContent = `Point for you! ${playerScore} to ${cpuScore}.`;
      serveBall(1);
    } else {
      cpuScore += 1;
      pongStatus.textContent = `Point for CPU. ${playerScore} to ${cpuScore}.`;
      serveBall(-1);
    }
    resetPowerups();
    updateScore();

    if (playerScore >= roundsToWin || cpuScore >= roundsToWin) {
      active = false;
      finished = true;
      pongStartButton.textContent = 'Play again';
      setSettingsLocked(false);
      pongStatus.textContent = playerScore >= roundsToWin ? 'You win! Play again?' : 'CPU wins this round. Try again?';
    }
    draw();
  };

  const activatePowerup = (type, timestamp, ball) => {
    const powerup = powerups[type];
    if (type === 'fire' && balls.length < 4) {
      const direction = ball.vy >= 0 ? 1 : -1;
      balls.push(
        { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy + (3 * direction) },
        { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy - (3 * direction) }
      );
      if (balls.length > 4) balls.length = 4;
    } else if (type === 'ice') {
      cpuFrozenUntil = timestamp + powerupDuration;
    } else if (type === 'lightning') {
      if (!lightningActive) balls.forEach((currentBall) => {
        currentBall.vx *= 1.55;
        currentBall.vy *= 1.55;
      });
      lightningActive = true;
      lightningUntil = timestamp + powerupDuration;
    } else if (type === 'boost') {
      playerBoostUntil = timestamp + powerupDuration;
    } else if (type === 'twin') {
      twinPaddlesUntil = timestamp + powerupDuration;
    }
    pongStatus.textContent = `${powerup.name} power-up!`;
    powerupDrop = null;
    nextPowerupAt = timestamp + 3500 + Math.random() * 2500;
  };

  const checkPaddleHit = (ball, paddle, height, direction, timestamp) => {
    if (direction < 0 && ball.vx >= 0) return false;
    if (direction > 0 && ball.vx <= 0) return false;
    const paddleTop = paddle.y - height / 2;
    const paddleRight = paddle.x + paddleWidth;
    if (ball.y < paddleTop || ball.y > paddleTop + height) return false;
    if (direction < 0 && ball.x - ballRadius > paddleRight) return false;
    if (direction > 0 && ball.x + ballRadius < paddle.x) return false;

    ball.x = direction < 0 ? paddleRight + ballRadius : paddle.x - ballRadius;
    ball.vx = Math.sign(-direction) * Math.min(Math.abs(ball.vx) * 1.04, 8);
    ball.vy += ((ball.y - paddle.y) / (height / 2)) * 1.6;
    if (powerupDrop && Math.hypot(ball.x - powerupDrop.x, ball.y - powerupDrop.y) < 30) {
      activatePowerup(powerupDrop.type, timestamp, ball);
    }
    return true;
  };

  const animate = (timestamp) => {
    animationFrame = 0;
    if (!active) {
      return;
    }
    const frameScale = Math.min((timestamp - previousFrame) / (1000 / 60), 2);
    previousFrame = timestamp;

    if (lightningActive && timestamp >= lightningUntil) {
      balls.forEach((ball) => {
        ball.vx /= 1.55;
        ball.vy /= 1.55;
      });
      lightningActive = false;
    }

    if (!powerupDrop && timestamp >= nextPowerupAt) {
      const types = Object.keys(powerups);
      powerupDrop = {
        x: courtWidth / 2 + (Math.random() - .5) * 180,
        y: 65 + Math.random() * (courtHeight - 130),
        type: types[Math.floor(Math.random() * types.length)]
      };
    }

    let pointScored = false;
    balls.forEach((ball) => {
      if (pointScored) return;
      ball.x += ball.vx * frameScale;
      ball.y += ball.vy * frameScale;
      if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= courtHeight) {
        ball.vy *= -1;
        ball.y = Math.max(ballRadius, Math.min(courtHeight - ballRadius, ball.y));
      }

      const playerHeight = timestamp < playerBoostUntil ? paddleHeight * 1.55 : paddleHeight;
      let playerHit = checkPaddleHit(ball, player, playerHeight, -1, timestamp);
      if (!playerHit && timestamp < twinPaddlesUntil) {
        const secondY = player.y < courtHeight / 2
          ? Math.min(player.y + 104, courtHeight - paddleHeight / 2)
          : Math.max(player.y - 104, paddleHeight / 2);
        playerHit = checkPaddleHit(ball, { x: player.x + 18, y: secondY }, paddleHeight * .82, -1, timestamp);
      }
      if (!playerHit) checkPaddleHit(ball, cpu, paddleHeight, 1, timestamp);

      if (powerupDrop && Math.hypot(ball.x - powerupDrop.x, ball.y - powerupDrop.y) < ballRadius + 16) {
        activatePowerup(powerupDrop.type, timestamp, ball);
      }

      if (ball.x + ballRadius < 0) {
        finishPoint('cpu');
        pointScored = true;
      } else if (ball.x - ballRadius > courtWidth) {
        finishPoint('player');
        pointScored = true;
      }
    });

    if (timestamp >= cpuFrozenUntil) {
      const incomingBall = balls.reduce((nearest, ball) =>
        ball.vx > 0 && (!nearest || ball.x > nearest.x) ? ball : nearest, null);
      if (incomingBall) {
        const cpuDifference = incomingBall.y - cpu.y;
        cpu.y += Math.sign(cpuDifference) * Math.min(Math.abs(cpuDifference), 3.3 * frameScale);
      }
    }
    clampPaddle(cpu);
    clampPaddle(player);

    draw();
    if (active) animationFrame = window.requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    previousFrame = performance.now();
    if (!animationFrame) animationFrame = window.requestAnimationFrame(animate);
  };

  const pauseGame = () => {
    if (!active) return;
    active = false;
    setSettingsLocked(false);
    pongStartButton.textContent = 'Resume game';
    pongStatus.textContent = 'Game paused.';
    draw();
  };

  const movePlayerToPointer = (event) => {
    if (!active) return;
    const bounds = pongCanvas.getBoundingClientRect();
    if (isMobileCourt()) {
      const horizontalPosition = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      setPlayerPosition((1 - horizontalPosition) * courtHeight);
    } else {
      setPlayerPosition(((event.clientY - bounds.top) / bounds.height) * courtHeight);
    }
    draw();
  };

  pongStartButton.addEventListener('click', () => {
    if (active) {
      pauseGame();
      return;
    }
    const newMatch = finished || (pongStartButton.textContent === 'Start game' && playerScore === 0 && cpuScore === 0);
    if (newMatch) {
      playerScore = 0;
      cpuScore = 0;
      finished = false;
      resetPowerups();
      setPlayerPosition(courtHeight / 2);
      cpu.y = courtHeight / 2;
      updateScore();
      serveBall(1);
      randomizeCpuCountry();
    }
    active = true;
    setSettingsLocked(true);
    pongStartButton.textContent = 'Pause game';
    pongStatus.textContent = isMobileCourt()
      ? 'Game on! Use the slider to move your paddle.'
      : 'Game on! Move your paddle to return the ball.';
    draw();
    startAnimation();
  });

  pongResetButton.addEventListener('click', () => {
    active = false;
    finished = false;
    setSettingsLocked(false);
    playerScore = 0;
    cpuScore = 0;
    setPlayerPosition(courtHeight / 2);
    cpu.y = courtHeight / 2;
    resetPowerups();
    randomizeCpuCountry();
    serveBall(1);
    updateScore();
    pongStartButton.textContent = 'Start game';
    pongStatus.textContent = 'Ready when you are. Start a game to play.';
    draw();
  });

  pongCanvas.addEventListener('pointermove', movePlayerToPointer);
  pongCanvas.addEventListener('pointerdown', (event) => {
    pongCanvas.focus();
    if (event.pointerType === 'touch') pongCanvas.setPointerCapture(event.pointerId);
    movePlayerToPointer(event);
  });
  pongCanvas.addEventListener('keydown', (event) => {
    if (!active) return;
    const key = event.key.toLowerCase();
    if (isMobileCourt() && (event.key === 'ArrowLeft' || key === 'a')) {
      event.preventDefault();
      setPlayerPosition(player.y + 24);
    } else if (isMobileCourt() && (event.key === 'ArrowRight' || key === 'd')) {
      event.preventDefault();
      setPlayerPosition(player.y - 24);
    } else if (!isMobileCourt() && (event.key === 'ArrowUp' || key === 'w')) {
      event.preventDefault();
      setPlayerPosition(player.y - 24);
    } else if (!isMobileCourt() && (event.key === 'ArrowDown' || key === 's')) {
      event.preventDefault();
      setPlayerPosition(player.y + 24);
    } else {
      return;
    }
    draw();
  });
  paddleSlider?.addEventListener('input', () => {
    setPlayerPosition((1 - Number(paddleSlider.value) / 1000) * courtHeight);
    draw();
  });
  countrySelect?.addEventListener('change', () => {
    playerColors = countryColors[countrySelect.value] || countryColors.jamaica;
    if (countrySelect.value === cpuCountry) randomizeCpuCountry();
    draw();
  });
  roundsSelect?.addEventListener('change', () => {
    roundsToWin = Number(roundsSelect.value) || 5;
    pongStatus.textContent = `Match set to first to ${roundsToWin}.`;
    draw();
  });
  pongOpenButton.addEventListener('click', () => {
    pongDialog.showModal();
    resizeCanvas();
    pongCloseButton.focus();
  });
  pongCloseButton.addEventListener('click', () => {
    pauseGame();
    pongDialog.close();
    pongOpenButton.focus();
  });
  pongDialog.addEventListener('cancel', pauseGame);
  randomizeCpuCountry();
  window.addEventListener('resize', () => {
    if (pongDialog.open) resizeCanvas();
  }, { passive: true });
}

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
