// =============================================================
// UNDANGAN PERNIKAHAN — script.js
// =============================================================
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. NAMA TAMU DARI URL (?to=Nama) ---------- */
  var params = new URLSearchParams(window.location.search);
  var guestParam = params.get('to') || params.get('nama');
  var guestNameEl = document.getElementById('guest-name');
  if (guestParam && guestNameEl) {
    guestNameEl.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
  }

  /* ---------- 2. BUKA UNDANGAN (tanpa pindah halaman) ---------- */
  var cover = document.getElementById('cover');
  var mainContent = document.getElementById('main-content');
  var openBtn = document.getElementById('open-invitation');
  var music = document.getElementById('bg-music');
  var musicToggle = document.getElementById('music-toggle');

  function openInvitation() {
    cover.classList.add('is-hidden');
    mainContent.hidden = false;
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);

    // Putar musik latar (dipicu oleh interaksi pengguna, jadi diperbolehkan browser)
    if (music) {
      music.volume = 0.6;
      var playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.then(function () {
          musicToggle.hidden = false;
          musicToggle.classList.add('playing');
        }).catch(function () {
          // Autoplay diblokir browser -> tampilkan tombol agar user menekan manual
          musicToggle.hidden = false;
          musicToggle.classList.remove('playing');
        });
      } else {
        musicToggle.hidden = false;
      }
    }

    // Setelah cover selesai fade-out, hilangkan dari alur dokumen
    setTimeout(function () {
      cover.style.display = 'none';
    }, 750);
  }

  if (openBtn) {
    openBtn.addEventListener('click', openInvitation);
  }

  // Kunci scroll saat cover masih tampil
  document.body.style.overflow = 'hidden';

  /* ---------- 3. TOMBOL TOGGLE MUSIK ---------- */
  if (musicToggle) {
    musicToggle.addEventListener('click', function () {
      if (music.paused) {
        music.play().catch(function () {});
        musicToggle.classList.add('playing');
      } else {
        music.pause();
        musicToggle.classList.remove('playing');
      }
    });
  }

  /* ---------- 4. COUNTDOWN ---------- */
  var countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    var targetDate = new Date(countdownEl.getAttribute('data-target')).getTime();
    var elDays = document.getElementById('cd-days');
    var elHours = document.getElementById('cd-hours');
    var elMins = document.getElementById('cd-mins');
    var elSecs = document.getElementById('cd-secs');

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
      var now = new Date().getTime();
      var diff = targetDate - now;

      if (diff <= 0) {
        elDays.textContent = '00';
        elHours.textContent = '00';
        elMins.textContent = '00';
        elSecs.textContent = '00';
        clearInterval(timer);
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((diff % (1000 * 60)) / 1000);

      elDays.textContent = pad(days);
      elHours.textContent = pad(hours);
      elMins.textContent = pad(mins);
      elSecs.textContent = pad(secs);
    }

    updateCountdown();
    var timer = setInterval(updateCountdown, 1000);
  }

  /* ---------- 5. SALIN NOMOR REKENING ---------- */
  var copyToast = document.getElementById('copy-toast');
  var copyButtons = document.querySelectorAll('.btn-copy');

  function showToast(msg) {
    if (!copyToast) return;
    copyToast.textContent = msg;
    copyToast.classList.add('show');
    setTimeout(function () { copyToast.classList.remove('show'); }, 2200);
  }

  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-account') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast('Nomor rekening berhasil disalin');
        }).catch(function () {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    });
  });

  function fallbackCopy(text) {
    var temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    try {
      document.execCommand('copy');
      showToast('Nomor rekening berhasil disalin');
    } catch (e) {
      showToast('Gagal menyalin, silakan salin manual');
    }
    document.body.removeChild(temp);
  }

  /* ---------- 6. GALERI FOTO (21 unit) + LIGHTBOX ---------- */
  var galleryGrid = document.getElementById('gallery-grid');
  var TOTAL_PHOTOS = 21;
  if (galleryGrid) {
    for (var i = 1; i <= TOTAL_PHOTOS; i++) {
      var img = document.createElement('img');
      img.src = 'assets/img/gallery/' + i + '.jpg';
      img.alt = 'Foto kenangan Indra & Putri ' + i;
      img.loading = 'lazy';
      img.addEventListener('click', (function (src, alt) {
        return function () { openLightbox(src, alt); };
      })(img.src, img.alt));
      galleryGrid.appendChild(img);
    }
  }

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.hidden = false;
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------- 7. BUKU TAMU ---------- */
  // Buku tamu memakai Google Form yang di-embed langsung lewat <iframe>
  // di index.html, jadi tidak perlu JavaScript tambahan di sini.
  // Lihat README.md bagian "Buku Tamu (Google Form)" untuk cara memasang
  // link embed Anda sendiri.

});
