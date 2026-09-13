/* ==========================================================================
   NITU'S BIRTHDAY WISHING SITE - INTERACTIVE JAVASCRIPT & AUDIO ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // State variables
  let soundEnabled = true;
  let audioCtx = null;
  let isCandlesBlown = false;

  // Initialize Web Audio API Context on first interaction
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ==========================================================================
  // WEB AUDIO SYNTHESIZER (No external audio file dependencies)
  // ==========================================================================

  // Play Pop Sound
  function playPopSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) { console.log(e); }
  }

  // Play Magic Chime / Unwrap Sound
  function playChimeSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.4);
      });
    } catch (e) { console.log(e); }
  }

  // Play Candle Blow / Whoosh Sound
  function playBlowSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch (e) { console.log(e); }
  }

  // Synthesize Happy Birthday Melody
  function playBirthdayMelody() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const notes = [
        { note: 264, duration: 0.35 }, { note: 264, duration: 0.35 },
        { note: 297, duration: 0.7 }, { note: 264, duration: 0.7 },
        { note: 352, duration: 0.7 }, { note: 330, duration: 1.2 },

        { note: 264, duration: 0.35 }, { note: 264, duration: 0.35 },
        { note: 297, duration: 0.7 }, { note: 264, duration: 0.7 },
        { note: 396, duration: 0.7 }, { note: 352, duration: 1.2 },

        { note: 264, duration: 0.35 }, { note: 264, duration: 0.35 },
        { note: 528, duration: 0.7 }, { note: 440, duration: 0.7 },
        { note: 352, duration: 0.7 }, { note: 330, duration: 0.7 }, { note: 297, duration: 0.7 },

        { note: 466, duration: 0.35 }, { note: 466, duration: 0.35 },
        { note: 440, duration: 0.7 }, { note: 352, duration: 0.7 },
        { note: 396, duration: 0.7 }, { note: 352, duration: 1.4 }
      ];

      let startTime = ctx.currentTime + 0.1;
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.note, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.duration - 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + n.duration);

        startTime += n.duration;
      });
    } catch (e) { console.log(e); }
  }

  // Audio Toggle UI Handler
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIcon.className = 'fa-solid fa-volume-high';
      soundLabel.textContent = 'Sound On';
      playChimeSound();
    } else {
      soundIcon.className = 'fa-solid fa-volume-xmark';
      soundLabel.textContent = 'Sound Off';
    }
  });

  // ==========================================================================
  // BACKGROUND SPARKLES & FIREWORKS CANVASES
  // ==========================================================================
  const sparklesCanvas = document.getElementById('sparklesCanvas');
  const sCtx = sparklesCanvas.getContext('2d');
  let sparkles = [];

  function resizeCanvases() {
    sparklesCanvas.width = window.innerWidth;
    sparklesCanvas.height = window.innerHeight;
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvases);

  // Sparkles init
  function initSparkles() {
    sparkles = [];
    const count = Math.floor(window.innerWidth / 12);
    for (let i = 0; i < count; i++) {
      sparkles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        gold: Math.random() > 0.4
      });
    }
  }

  function drawSparkles() {
    sCtx.clearRect(0, 0, sparklesCanvas.width, sparklesCanvas.height);
    sparkles.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;

      sCtx.save();
      sCtx.globalAlpha = Math.abs(s.alpha);
      sCtx.fillStyle = s.gold ? '#f7e5b5' : '#e0a9af';
      sCtx.shadowBlur = 8;
      sCtx.shadowColor = s.gold ? '#d4af37' : '#b76e79';
      sCtx.beginPath();
      sCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.restore();
    });
    requestAnimationFrame(drawSparkles);
  }

  // Fireworks Engine
  const fireworksCanvas = document.getElementById('fireworksCanvas');
  const fCtx = fireworksCanvas.getContext('2d');
  let particles = [];

  function createFirework(x, y) {
    const colors = ['#e0a9af', '#f7e5b5', '#d4af37', '#ffffff', '#b76e79', '#ffdf00'];
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  function updateFireworks() {
    fCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      } else {
        fCtx.save();
        fCtx.globalAlpha = p.alpha;
        fCtx.fillStyle = p.color;
        fCtx.shadowBlur = 10;
        fCtx.shadowColor = p.color;
        fCtx.beginPath();
        fCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.restore();
      }
    }
    requestAnimationFrame(updateFireworks);
  }

  resizeCanvases();
  initSparkles();
  drawSparkles();
  updateFireworks();

  // ==========================================================================
  // UNBOXING HERO HANDLER WITH PERSISTENT FLOATING CIRCULAR PHOTOS & PAPER BURST
  // ==========================================================================
  const giftBoxBtn = document.getElementById('giftBoxBtn');
  const giftBurstContainer = document.getElementById('giftBurstContainer');
  const ambientFloatingContainer = document.getElementById('ambientFloatingContainer');
  const heroScreen = document.getElementById('heroScreen');
  const mainPortal = document.getElementById('mainPortal');
  let isUnboxed = false;

  const photoSources = [
    { src: 'assets/side_nitu_red_saree_sq.jpg', fullSrc: 'assets/side_nitu_red_saree.jpg', caption: 'Gorgeous Birthday Queen Nitu 💖 | Red Saree Elegance' },
    { src: 'assets/nitu_photo_restaurant_sq.jpg', fullSrc: 'assets/nitu_photo_restaurant.jpg', caption: 'Stunning Glamour ✨ | Queen Nitu in Green Saree' },
    { src: 'assets/side_nitu_blue_saree_sq.jpg', fullSrc: 'assets/side_nitu_blue_saree.jpg', caption: 'Vibrant Sunshine & Elegance 👑 | Queen Nitu' },
    { src: 'assets/nitu_photo_mall_selfie_sq.jpg', fullSrc: 'assets/nitu_photo_mall_selfie.jpg', caption: 'Shining Bright Always 💕 | Birthday Queen Nitu' },
    { src: 'assets/side_nitu_green_saree_sq.jpg', fullSrc: 'assets/side_nitu_green_saree.jpg', caption: 'Pure Grace & Charm ✨ | Queen Nitu' }
  ];

  // Screen positions for ambient floating circular photos (responsive)
  function getResponsivePositions() {
    if (window.innerWidth < 600) {
      return [
        { top: '10%', left: '2%' },
        { top: '16%', right: '2%' },
        { top: '48%', left: '1%' },
        { top: '72%', right: '1%' },
        { top: '88%', left: '2%' }
      ];
    } else {
      return [
        { top: '15%', left: '4%' },
        { top: '22%', right: '5%' },
        { top: '55%', left: '3%' },
        { top: '65%', right: '4%' },
        { top: '82%', left: '6%' }
      ];
    }
  }

  const paperColors = [
    '#f7e5b5', '#d4af37', '#e0a9af', '#b76e79', '#ffffff', '#ffdf00', '#fce4ec'
  ];

  giftBoxBtn.addEventListener('click', (e) => {
    if (isUnboxed) return;
    isUnboxed = true;

    // Rumble suspense box
    giftBoxBtn.classList.add('opening-rumble');
    const questionOverlay = giftBoxBtn.querySelector('.question-overlay');
    if (questionOverlay) {
      questionOverlay.style.opacity = '0';
    }

    playChimeSound();

    // 1. Spawn Circular Photos bursting out in 360-degree ring (scaled for mobile viewport)
    const maxRadius = Math.min(220, window.innerWidth * 0.35);
    photoSources.forEach((photoObj, idx) => {
      const img = document.createElement('img');
      img.src = photoObj.src;
      img.className = 'burst-circular-photo';

      const angle = (Math.PI * 2 / photoSources.length) * idx - Math.PI / 2;
      const distance = Math.random() * 30 + Math.max(100, maxRadius - 30);
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 30; // -15deg to +15deg

      img.style.setProperty('--tx', `${tx}px`);
      img.style.setProperty('--ty', `${ty}px`);
      img.style.setProperty('--rot', `${rot}deg`);
      img.style.animationDelay = `${idx * 0.08}s`;

      giftBurstContainer.appendChild(img);
    });

    // 2. Spawn Decorative Paper Streamers & Confetti Strips
    const paperCount = Math.min(55, Math.floor(window.innerWidth / 8));
    for (let i = 0; i < paperCount; i++) {
      const paper = document.createElement('div');
      paper.className = 'burst-decor-paper';

      const pAngle = Math.random() * Math.PI * 2;
      const pDistance = Math.random() * (maxRadius + 40) + 60;
      const ptx = Math.cos(pAngle) * pDistance;
      const pty = Math.sin(pAngle) * pDistance;

      const width = Math.random() * 10 + 5;
      const height = Math.random() * 20 + 8;
      const bg = paperColors[Math.floor(Math.random() * paperColors.length)];

      paper.style.width = `${width}px`;
      paper.style.height = `${height}px`;
      paper.style.backgroundColor = bg;
      paper.style.setProperty('--ptx', `${ptx}px`);
      paper.style.setProperty('--pty', `${pty}px`);
      paper.style.animationDelay = `${Math.random() * 0.25}s`;

      giftBurstContainer.appendChild(paper);
    }

    // 3. Launch fireworks burst sequence
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    createFirework(cx, cy - 80);
    createFirework(cx - Math.min(200, window.innerWidth * 0.25), cy - 50);
    createFirework(cx + Math.min(200, window.innerWidth * 0.25), cy - 50);
    setTimeout(() => {
      createFirework(cx - Math.min(100, window.innerWidth * 0.15), cy - 150);
      createFirework(cx + Math.min(100, window.innerWidth * 0.15), cy - 150);
    }, 400);

    // 4. Spawn Persistent Floating Circular Photos around screen margins
    setTimeout(() => {
      const currentPositions = getResponsivePositions();
      photoSources.forEach((photoObj, idx) => {
        const floatImg = document.createElement('img');
        floatImg.src = photoObj.src;
        floatImg.className = 'floating-circular-photo';

        const pos = currentPositions[idx % currentPositions.length];
        if (pos.top) floatImg.style.top = pos.top;
        if (pos.left) floatImg.style.left = pos.left;
        if (pos.right) floatImg.style.right = pos.right;

        floatImg.style.setProperty('--duration', `${Math.random() * 3 + 5}s`);
        floatImg.style.setProperty('--delay', `${Math.random() * 2}s`);

        // Click to view photo modal & trigger sparkle
        floatImg.addEventListener('click', (evt) => {
          playPopSound();
          createFirework(evt.clientX, evt.clientY);

          lightboxImg.src = photoObj.fullSrc || photoObj.src;
          lightboxCaption.textContent = photoObj.caption;
          photoLightbox.classList.remove('hidden');
        });

        ambientFloatingContainer.appendChild(floatImg);
      });
    }, 1200);

    // 5. Smoothly fade suspense screen out and reveal Main Celebration Portal
    setTimeout(() => {
      heroScreen.classList.add('fade-out');
    }, 1600);

    setTimeout(() => {
      heroScreen.classList.add('hidden');
      mainPortal.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      initBalloons();
      drawWheel();

      // Play celebratory birthday chime on reveal
      playBirthdayMelody();
    }, 2200);
  });

  // ==========================================================================
  // CANDLE CAKE HANDLER
  // ==========================================================================
  const blowCandlesBtn = document.getElementById('blowCandlesBtn');
  const playMelodyBtn = document.getElementById('playMelodyBtn');
  const wishBanner = document.getElementById('wishBanner');
  const flames = [document.getElementById('flame1'), document.getElementById('flame2'), document.getElementById('flame3')];
  const smokes = [document.getElementById('smoke1'), document.getElementById('smoke2'), document.getElementById('smoke3')];

  function extinguishCandles() {
    if (isCandlesBlown) return;
    isCandlesBlown = true;

    playBlowSound();

    flames.forEach((flame, idx) => {
      setTimeout(() => {
        flame.classList.add('off');
        smokes[idx].classList.add('active');
      }, idx * 150);
    });

    setTimeout(() => {
      playBirthdayMelody();
      wishBanner.classList.remove('hidden');

      // Launch celebration fireworks
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          createFirework(
            Math.random() * (window.innerWidth - 200) + 100,
            Math.random() * (window.innerHeight / 2) + 100
          );
        }, i * 400);
      }
    }, 600);
  }

  blowCandlesBtn.addEventListener('click', extinguishCandles);
  document.querySelectorAll('.candle').forEach(candle => {
    candle.addEventListener('click', extinguishCandles);
  });

  playMelodyBtn.addEventListener('click', () => {
    playBirthdayMelody();
  });

  // ==========================================================================
  // POLAROID MEMORIES HANDLER (3D PARALLAX TILT & DYNAMIC SPARKLE TRAILS)
  // ==========================================================================
  const photoLightbox = document.getElementById('photoLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightbox = document.getElementById('closeLightbox');

  document.querySelectorAll('.polaroid-card').forEach(card => {
    // 3D Parallax Tilt & Sparkle Trail Emitter on Mouse Move
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((centerY - y) / centerY) * 14;
      const rotateY = ((x - centerX) / centerX) * 14;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08) translateY(-8px)`;

      // Emit live sparkles on hover
      if (Math.random() > 0.55) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * -2 - 1,
          alpha: 1,
          color: Math.random() > 0.4 ? '#f7e5b5' : '#e0a9af',
          decay: 0.035
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    card.addEventListener('click', (e) => {
      playPopSound();
      createFirework(e.clientX, e.clientY);

      const photoSrc = card.getAttribute('data-photo');
      const captionText = card.getAttribute('data-caption');

      lightboxImg.src = photoSrc;
      lightboxCaption.textContent = captionText;
      photoLightbox.classList.remove('hidden');
    });
  });

  closeLightbox.addEventListener('click', () => {
    photoLightbox.classList.add('hidden');
  });

  photoLightbox.addEventListener('click', (e) => {
    if (e.target === photoLightbox) {
      photoLightbox.classList.add('hidden');
    }
  });

  // ==========================================================================
  // TAB NAVIGATION
  // ==========================================================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playPopSound();
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // ==========================================================================
  // BALLOON POP MINI GAME
  // ==========================================================================
  const balloonStage = document.getElementById('balloonStage');
  const complimentsList = document.getElementById('complimentsList');
  let unlockedCount = 0;

  const nituCompliments = [
    "Nitu has the prettiest smile! 😊",
    "Absolute fashion & glam queen! 👗",
    "Always there when you need a hug! 💕",
    "Master of hilarious gossip & jokes! 👑",
    "Pure sunshine in everyone's life! ☀️",
    "Loyal best friend forever & ever! 🥂",
    "Smart, fierce, and unbreakable! ✨"
  ];

  function initBalloons() {
    balloonStage.innerHTML = '';
    const colors = ['#e0a9af', '#b76e79', '#f7e5b5', '#d4af37', '#fce4ec'];

    for (let i = 0; i < 6; i++) {
      spawnBalloon(colors[i % colors.length], i * 0.8);
    }
  }

  function spawnBalloon(color, delay) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.backgroundColor = color;
    balloon.style.left = `${Math.random() * 75 + 10}%`;
    balloon.style.animationDelay = `${delay}s`;

    balloon.addEventListener('click', () => {
      playPopSound();
      balloon.style.transform = 'scale(1.4)';
      balloon.style.opacity = '0';
      setTimeout(() => balloon.remove(), 200);

      // Add compliment tag
      if (unlockedCount === 0) complimentsList.innerHTML = '';
      const text = nituCompliments[unlockedCount % nituCompliments.length];
      unlockedCount++;

      const tag = document.createElement('span');
      tag.className = 'compliment-tag';
      tag.textContent = text;
      complimentsList.appendChild(tag);

      // Respawn balloon after 2s
      setTimeout(() => {
        spawnBalloon(color, 0);
      }, 2000);
    });

    balloonStage.appendChild(balloon);
  }

  // ==========================================================================
  // SPIN THE BESTIE WISH WHEEL
  // ==========================================================================
  const wheelCanvas = document.getElementById('wheelCanvas');
  const wCtx = wheelCanvas.getContext('2d');
  const spinWheelBtn = document.getElementById('spinWheelBtn');
  const wheelResultModal = document.getElementById('wheelResultModal');
  const wheelRewardText = document.getElementById('wheelRewardText');

  const rewards = [
    "Free Coffee & Gossip Date ☕",
    "Shopping Spree Ally 🛍️",
    "Late-Night Ice Cream 🍰",
    "Full-Day Spa & Hugs 💆‍♀️",
    "100 Unlimited Compliments 👑",
    "Movie Night Treat 🍿"
  ];

  const colors = ['#b76e79', '#d4af37', '#e0a9af', '#3a2040', '#f7e5b5', '#8b3a4a'];
  let currentAngle = 0;
  let isSpinning = false;

  function drawWheel() {
    const numSlices = rewards.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    const radius = wheelCanvas.width / 2;

    wCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    wCtx.save();
    wCtx.translate(radius, radius);
    wCtx.rotate(currentAngle);

    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceAngle;
      wCtx.beginPath();
      wCtx.moveTo(0, 0);
      wCtx.arc(0, 0, radius - 5, angle, angle + sliceAngle);
      wCtx.closePath();

      wCtx.fillStyle = colors[i];
      wCtx.fill();
      wCtx.lineWidth = 2;
      wCtx.strokeStyle = 'rgba(255,255,255,0.4)';
      wCtx.stroke();

      // Text on Slice
      wCtx.save();
      wCtx.rotate(angle + sliceAngle / 2);
      wCtx.textAlign = 'right';
      wCtx.fillStyle = (i === 3 || i === 5) ? '#ffffff' : '#120914';
      wCtx.font = 'bold 13px Outfit, sans-serif';
      wCtx.fillText(rewards[i], radius - 20, 5);
      wCtx.restore();
    }

    wCtx.restore();
  }

  spinWheelBtn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    wheelResultModal.classList.add('hidden');

    const extraRounds = Math.floor(Math.random() * 4) + 5;
    const targetAngle = currentAngle + (extraRounds * Math.PI * 2) + (Math.random() * Math.PI * 2);
    const duration = 4000;
    const start = performance.now();

    function animateSpin(now) {
      const elapsed = now - start;
      if (elapsed < duration) {
        // Ease-out cubic
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = easeOut * (targetAngle - currentAngle) + currentAngle;
        drawWheel();
        if (Math.random() > 0.8) playPopSound();
        requestAnimationFrame(animateSpin);
      } else {
        isSpinning = false;
        currentAngle = targetAngle % (Math.PI * 2);
        drawWheel();

        // Calculate Winner
        const sliceAngle = (Math.PI * 2) / rewards.length;
        // Pointer is at Top (3PI/2 or 270 deg)
        const normalized = (Math.PI * 2.5 - currentAngle) % (Math.PI * 2);
        const winIdx = Math.floor(normalized / sliceAngle) % rewards.length;

        wheelRewardText.textContent = rewards[winIdx];
        wheelResultModal.classList.remove('hidden');
        playChimeSound();
        createFirework(window.innerWidth / 2, window.innerHeight / 2);
      }
    }

    requestAnimationFrame(animateSpin);
  });

  // ==========================================================================
  // SECRET HEART LOCKBOX
  // ==========================================================================
  const unlockBtn = document.getElementById('unlockBtn');
  const passcodeInput = document.getElementById('passcodeInput');
  const letterContainer = document.getElementById('letterContainer');
  const heartLockIcon = document.getElementById('heartLockIcon');

  unlockBtn.addEventListener('click', () => {
    playChimeSound();
    heartLockIcon.innerHTML = '<i class="fa-solid fa-heart-circle-check"></i>';
    heartLockIcon.style.color = '#f7e5b5';

    letterContainer.classList.remove('hidden');
    letterContainer.scrollIntoView({ behavior: 'smooth' });

    createFirework(window.innerWidth / 2, window.innerHeight / 2);
  });

});
