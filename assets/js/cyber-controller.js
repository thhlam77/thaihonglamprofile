/**
 * THÁI HỒNG LÂM - CYBER CONTROLLER (100% DINHDUYVINH.DEV REPLICA & ENHANCEMENTS)
 * Features:
 *  - Mechanical Switch "Tách Tách" Sound via Web Audio API
 *  - Interactive 3D Tilt on Gundam Model Cards
 *  - Vinyl Music Player replica (Matching Image 1) with 5 Tracks
 *  - 6-Photo Lightbox Modal Popup (Matching Image 2)
 *  - Bioluminescent Canvas Background with Cursor Glow
 *  - Contact Form linked directly to himngminhlalam@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. TIẾNG CÔNG TẮC ĐÈN "TÁCH TÁCH" CỰC THẬT (WEB AUDIO API)
  // =========================================================================
  let audioCtx = null;

  function playSwitchSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const t = audioCtx.currentTime;
      const isDarkNow = document.body.classList.contains('dark');

      const comp = audioCtx.createDynamicsCompressor();
      const master = audioCtx.createGain();
      master.gain.value = 1.0;
      comp.connect(master);
      master.connect(audioCtx.destination);

      // Bộ đệm nhiễu trắng ngắn dùng chung cho các tiếng "tách"
      const noiseLen = Math.floor(audioCtx.sampleRate * 0.05);
      const noiseBuf = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;

      // Một tiếng "tách" gọn: nhiễu sắc + thân gõ "cộp" ngắn
      function tach(st, pitch, vol) {
        const n = audioCtx.createBufferSource();
        n.buffer = noiseBuf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 3800 * pitch;
        bp.Q.value = 1.4;
        const ng = audioCtx.createGain();
        ng.gain.setValueAtTime(vol, st);
        ng.gain.exponentialRampToValueAtTime(0.001, st + 0.022);
        n.connect(bp); bp.connect(ng); ng.connect(comp);
        n.start(st); n.stop(st + 0.03);

        const body = audioCtx.createOscillator();
        const bg = audioCtx.createGain();
        body.type = 'triangle';
        body.frequency.setValueAtTime(260 * pitch, st);
        body.frequency.exponentialRampToValueAtTime(110 * pitch, st + 0.03);
        bg.gain.setValueAtTime(vol * 0.9, st);
        bg.gain.exponentialRampToValueAtTime(0.001, st + 0.04);
        body.connect(bg); bg.connect(comp);
        body.start(st); body.stop(st + 0.05);

        const tick = audioCtx.createOscillator();
        const tg = audioCtx.createGain();
        tick.type = 'square';
        tick.frequency.setValueAtTime(2600 * pitch, st);
        tick.frequency.exponentialRampToValueAtTime(900 * pitch, st + 0.008);
        tg.gain.setValueAtTime(vol * 0.35, st);
        tg.gain.exponentialRampToValueAtTime(0.001, st + 0.012);
        tick.connect(tg); tg.connect(comp);
        tick.start(st); tick.stop(st + 0.015);
      }

      // "Tách... tách": nhấn xuống rồi nảy lên. Bật sáng cao hơn, bật tối trầm hơn.
      const base = isDarkNow ? 0.85 : 1.1;
      tach(t, base, 0.9);
      tach(t + 0.07, base * 1.12, 0.65);
    } catch (e) {
      // Audio context error handled gracefully
    }
  }

  // Xuất hàm âm thanh ra window để main.js và các nút khác dùng chung
  window.playMechanicalSwitchSound = playSwitchSound;


  // =========================================================================
  // 3. CANVAS HẠT SÁNG & BỌT KHÍ ĐẠI DƯƠNG PHẢN ỨNG CHUỘT
  // =========================================================================
  const canvas = document.getElementById('cyber-bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class CyberParticle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.radius = Math.random() * 2.4 + 0.6;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.opacity = Math.random() * 0.5 + 0.2;
        const colors = [
          'rgba(0, 245, 212,',  // Cyan
          'rgba(139, 92, 246,', // Purple
          'rgba(255, 42, 133,'  // Hot Pink
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.8;
            this.y -= (dy / dist) * force * 1.8;
          }
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color} ${this.opacity})`;
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = this.radius * 3.5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initParticles() {
      const count = Math.min(Math.floor((width * height) / 18000), 55);
      particles = [];
      for (let i = 0; i < count; i++) particles.push(new CyberParticle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
  }

  // =========================================================================
  // 4. INTERACTIVE 3D PERSPECTIVE TILT TRÊN THẺ GUNDAM
  // =========================================================================
  const gundamCards = document.querySelectorAll('.gundam-card');
  gundamCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 16;
      const rotateY = (x / rect.width) * 16;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });
  });

  // =========================================================================
  // 5. ALBUM 6 ẢNH & LIGHTBOX MODAL POPUP (CHUẨN 100% ẢNH 2)
  // =========================================================================
  const albumItems = document.querySelectorAll('.carousel__item_six');
  const popupOverlay = document.querySelector('.popup__overlay_custom');
  const popupClose = document.querySelector('.popup__close_photo');
  const popupImg = document.querySelector('.popup__image_photo');
  const popupTitle = document.querySelector('.popup__title_photo');
  const popupTime = document.querySelector('.popup__time_photo');
  const popupCaption = document.querySelector('.popup__caption_text');

  let currentPhotoIdx = 0;
  const photosList = [];

  albumItems.forEach((item, idx) => {
    const img = item.querySelector('img');
    const title = item.querySelector('.popup__title');
    const time = item.querySelector('.popup__time');
    const caption = item.querySelector('.popup__caption');

    photosList.push({
      src: img ? img.src : '',
      title: title ? title.textContent : '',
      time: time ? time.textContent : '',
      caption: caption ? caption.textContent : ''
    });

    item.addEventListener('click', () => {
      openLightbox(idx);
    });
  });

  function openLightbox(idx) {
    if (!popupOverlay) return;
    currentPhotoIdx = idx;
    const photo = photosList[idx];
    if (!photo) return;

    if (popupImg) popupImg.src = photo.src;
    if (popupTitle) popupTitle.textContent = photo.title;
    if (popupTime) popupTime.textContent = photo.time;
    if (popupCaption) popupCaption.textContent = `“${photo.caption}”`;

    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!popupOverlay) return;
    popupOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (popupClose) popupClose.addEventListener('click', closeLightbox);
  if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (popupOverlay && popupOverlay.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') {
        currentPhotoIdx = (currentPhotoIdx + 1) % photosList.length;
        openLightbox(currentPhotoIdx);
      }
      if (e.key === 'ArrowLeft') {
        currentPhotoIdx = (currentPhotoIdx - 1 + photosList.length) % photosList.length;
        openLightbox(currentPhotoIdx);
      }
    }
  });

  // =========================================================================
  // 6. VINYL MUSIC PLAYER (CHUẨN 100% ẢNH 1 & PLAYLIST 5 BÀI)
  // =========================================================================
  // ╔═══════════════════════════════════════════════════════════════════════╗
  // ║  ★★★  CHỖ CHÈN LINK .MP3 CHO 5 BÀI HÁT  ★★★                          ║
  // ║  Thứ tự dưới đây KHỚP 100% với danh sách 01 → 05 trên trang web.       ║
  // ║  Muốn đổi bài: chỉ cần thay đường dẫn trong dấu '...' của từng dòng.   ║
  // ║  Có thể dùng file trong thư mục assets/music/ HOẶC link https://...   ║
  // ╚═══════════════════════════════════════════════════════════════════════╝
  const MP3_LINKS = [
    'assets/music/xindungroixaanh.mp3',          // 01 - XIN ĐỪNG RỜI XA ANH
    'assets/music/anhdaluadoiemroi.mp3',         // 02 - ANH ĐÃ LỪA DỐI EM RỒI
    'assets/music/Vietnam.mp3',                  // 03 - VIETNAM - My Home
    'assets/music/thienduongvoinguoithuong.mp3', // 04 - THIÊN ĐƯỜNG VỚI NGƯỜI THƯƠNG
    'assets/music/dongsuoinhochay.mp3'           // 05 - 小河淌水 (Dòng Suối Nhỏ Chảy)
  ];

  // Thông tin hiển thị (thứ tự giống hệt danh sách bên phải)
  const playlist = [
    {
      title: 'XIN ĐỪNG RỜI XA ANH',
      artist: 'LÊ GIA BẢO X THAZH X ĐÔNG REMIX',
      cover: 'https://image-cdn.nct.vn/song/2026/04/24/X/y/Y/t/1777012374636.jpg',
      src: MP3_LINKS[0]
    },
    {
      title: 'ANH ĐÃ LỪA DỐI EM RỒI',
      artist: 'QUANG KIỆT X THAZH X ĐÔNG REMIX',
      cover: 'https://image-cdn.nct.vn/song/2026/01/20/7/2/5/d/1768893985530_300.jpg',
      src: MP3_LINKS[1]
    },
    {
      title: 'VIETNAM - My Home',
      artist: 'Masew, MyoMouse, Nguyen Loi (Version 2: Sáo)',
      cover: 'assets/img/image/vietnammyhome.png',
      src: MP3_LINKS[2]
    },
    {
      title: 'THIÊN ĐƯỜNG VỚI NGƯỜI THƯƠNG',
      artist: 'PHƯƠNG MỸ CHI & DTAP',
      cover: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/772725892_1594697042024511_5869361136042496186_n.jpg?stp=dst-jpg_tt6&cstp=mx1638x2048&ctp=s1638x2048&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGGz2pjOKkmxEHzl0zFvxfihQ2iOnQnSq2FDaI6dCdKrXwQCMJVM60WvEV9vTad6R_Pc_1b2GQYjQ_jehlKQkaz&_nc_ohc=ryyLDluPo_oQ7kNvwEgfAi6&_nc_oc=AdqUqqgub5yqJDWVmj7p3yr0J9VQIG1G-35_aYn9Mtdw-NveQB02rgW1-2V3ZhBXKB4&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=jWwpza-KeiZPe67gKZHsLg&_nc_ss=7b2a8&oh=00_AQOgvQYsSi36V3rhVpxtrqa_-m7fHvgdpi5Rep_Rw-bAnw&oe=6AD0C068',
      src: MP3_LINKS[3]
    },
    {
      title: '小河淌水(Dòng Suối Nhỏ Chảy)',
      artist: '尹宜公',
      cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6cizbfCchVXX6dbzAmdUK_EsoeDrO5S_oqAf4PhmHStsk_GaiTbCf3Vw&s=10',
      src: MP3_LINKS[4]
    }
  ];

  let currentTrackIdx = 0;
  let isPlaying = false;

  // Bộ phát nhạc thật (HTML5 Audio)
  const audio = new Audio();
  audio.preload = 'metadata';

  const playerBox = document.querySelector('.music-player-container-img1');
  const vinylDisc = document.getElementById('vinylDisc');
  const vinylCenterCover = document.getElementById('vinylCenterCover');
  const songTitleEl = document.getElementById('playerSongTitle');
  const songArtistEl = document.getElementById('playerSongArtist');
  const playPauseBtn = document.getElementById('btnPlayPause');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const prevBtn = document.getElementById('btnPrevTrack');
  const nextBtn = document.getElementById('btnNextTrack');
  const curTimeEl = document.getElementById('playerCurrentTime');
  const totalDurEl = document.getElementById('playerTotalDuration');
  const progFill = document.getElementById('playerProgressFill');
  const progTrack = document.getElementById('playerProgressTrack');
  const trackItems = document.querySelectorAll('.track-item-card');

  function fmtTime(t) {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const sc = Math.floor(t % 60);
    return `${m}:${sc < 10 ? '0' : ''}${sc}`;
  }

  function setPlayingUI(on) {
    isPlaying = on;
    if (vinylDisc) {
      vinylDisc.classList.add('has-started');
      vinylDisc.classList.toggle('playing', on);
    }
    if (playerBox) playerBox.classList.toggle('is-playing', on);
    if (playPauseIcon) playPauseIcon.className = on ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  }

  function updateProgressUI() {
    const dur = audio.duration;
    if (curTimeEl) curTimeEl.textContent = fmtTime(audio.currentTime);
    if (progFill) progFill.style.width = (isFinite(dur) && dur > 0) ? `${Math.min(100, (audio.currentTime / dur) * 100)}%` : '0%';
  }

  function safePlay() {
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { setPlayingUI(false); });
    }
  }

  function loadTrack(index) {
    currentTrackIdx = index;
    const track = playlist[index];
    if (!track) return;

    if (vinylCenterCover) vinylCenterCover.src = track.cover;
    if (songTitleEl) songTitleEl.textContent = track.title;
    if (songArtistEl) songArtistEl.textContent = track.artist;
    if (totalDurEl) totalDurEl.textContent = '0:00';

    audio.src = track.src;
    audio.load();
    updateProgressUI();
    if (progFill) progFill.style.width = '0%';

    trackItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });

    if ('mediaSession' in navigator && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          artwork: [{ src: track.cover }]
        });
      } catch (e) { /* bỏ qua */ }
    }
  }

  function togglePlay() {
    if (audio.paused) {
      safePlay();
    } else {
      audio.pause();
    }
  }

  function nextTrack() {
    const wasPlaying = isPlaying;
    loadTrack((currentTrackIdx + 1) % playlist.length);
    if (wasPlaying) safePlay();
  }

  function prevTrack() {
    const wasPlaying = isPlaying;
    loadTrack((currentTrackIdx - 1 + playlist.length) % playlist.length);
    if (wasPlaying) safePlay();
  }

  // Sự kiện từ bộ phát nhạc thật
  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('playing', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('timeupdate', updateProgressUI);
  audio.addEventListener('loadedmetadata', () => {
    if (totalDurEl) totalDurEl.textContent = fmtTime(audio.duration);
    const timeEl = trackItems[currentTrackIdx] && trackItems[currentTrackIdx].querySelector('.track-time-dur');
    if (timeEl) timeEl.textContent = fmtTime(audio.duration);
    updateProgressUI();
  });
  audio.addEventListener('ended', () => {
    loadTrack((currentTrackIdx + 1) % playlist.length);
    safePlay();
  });
  audio.addEventListener('error', () => {
    setPlayingUI(false);
    if (songArtistEl) songArtistEl.textContent = '⚠ Không tải được file mp3 - kiểm tra lại link!';
    // eslint-disable-next-line no-console
    console.warn('Không tải được MP3:', playlist[currentTrackIdx] && playlist[currentTrackIdx].src);
  });

  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);

  if (progTrack) {
    progTrack.addEventListener('click', (e) => {
      if (!isFinite(audio.duration) || audio.duration <= 0) return;
      const rect = progTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      audio.currentTime = pct * audio.duration;
      updateProgressUI();
    });
  }

  trackItems.forEach((item) => {
    item.addEventListener('click', () => {
      const idx = +item.getAttribute('data-track-index');
      loadTrack(idx);
      safePlay();
    });
  });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => safePlay());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    } catch (e) { /* bỏ qua */ }
  }

  loadTrack(0);

  // Hiện sẵn thời lượng thật của cả 5 bài trong danh sách (chỉ tải metadata, rất nhẹ)
  playlist.forEach((track, i) => {
    try {
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.addEventListener('loadedmetadata', () => {
        const el = trackItems[i] && trackItems[i].querySelector('.track-time-dur');
        if (el && isFinite(probe.duration)) el.textContent = fmtTime(probe.duration);
      });
      probe.src = track.src;
    } catch (e) { /* bỏ qua */ }
  });

  // =========================================================================
  // 7. FORM LIÊN HỆ GỬI TỚI HIMNGMINHLALAM@GMAIL.COM (BỎ GOOGLE MAPS)
  // (Đã xử lý an toàn tại main.js, giữ fallback không gây lỗi)
  // =========================================================================
  const legacyContactForm = document.getElementById('customContactForm');
  if (legacyContactForm) {
    legacyContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contactName') || document.getElementById('name');
      const emailInput = document.getElementById('contactEmail') || document.getElementById('email');
      const msgInput = document.getElementById('contactMessage') || document.getElementById('message');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const msg = msgInput ? msgInput.value.trim() : '';
      if (!name || !email || !msg) return;
      const subject = encodeURIComponent(`[Website Profile] Tin nhắn từ ${name} (${email})`);
      const body = encodeURIComponent(`Xin chào Thái Hồng Lâm!\n\nTôi là: ${name}\nEmail liên hệ: ${email}\n\nNội dung:\n${msg}\n\nTrân trọng!`);
      window.location.href = `mailto:himngminhlalam@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // =========================================================================
  // 8. SCROLLSPY CHO THANH DOCK NAVBAR
  // =========================================================================
  const navLinks = document.querySelectorAll('.nav__menu a.nav__link');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const sections = document.querySelectorAll('section[id]');

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 160;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav__menu a[href*='${sectionId}']`);

      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach((l) => l.classList.remove('active-link'));
          targetLink.classList.add('active-link');
        }
      }
    });
  });
});
