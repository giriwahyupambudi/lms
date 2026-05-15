let deferredPrompt;

// PWA Installation Logic
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✅ PWA beforeinstallprompt event fired!');
  
  // Show install promotion after 3 seconds if not already in standalone mode
  if (!isStandalone()) {
    setTimeout(() => {
      showInstallPromotion();
    }, 3000);
  }
});

// Utility: Check if running in standalone mode (installed PWA)
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Utility: Check if using Google Chrome
function isChrome() {
  const ua = navigator.userAgent;
  const isChromium = ua.includes("Chrome") || ua.includes("CriOS"); // CriOS is Chrome on iOS
  const isEdge = ua.includes("Edg");
  const isOpera = ua.includes("OPR") || ua.includes("Opt");
  
  // We want specifically Google Chrome (Chromium-based without Edge/Opera branding)
  // or Chrome on iOS.
  return isChromium && !isEdge && !isOpera;
}

// Browser Compatibility Check
function checkBrowserCompatibility() {
  // If already installed as app, no need to warn
  if (isStandalone()) return;

  // If already dismissed for this session, don't show again
  if (sessionStorage.getItem('browser_warning_dismissed')) return;

  // If NOT Chrome, show the premium warning
  if (!isChrome()) {
    showBrowserWarning();
  }
}

function showBrowserWarning() {
  const overlay = document.createElement('div');
  overlay.id = 'browser-warning-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.4s ease;
  `;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  overlay.innerHTML = `
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .warning-card {
        background: white;
        border-radius: 24px;
        max-width: 400px;
        width: 100%;
        padding: 32px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        text-align: center;
        animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Inter', sans-serif;
      }
      .warning-icon {
        width: 64px;
        height: 64px;
        background: #fef2f2;
        color: #ef4444;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin: 0 auto 20px;
      }
      .warning-title {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 12px;
      }
      .warning-desc {
        font-size: 14px;
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .chrome-promo {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
      }
      .chrome-icon {
        font-size: 24px;
        color: #4285F4;
      }
      .promo-text {
        font-size: 13px;
        font-weight: 500;
        color: #334155;
      }
      .btn-primary {
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
        margin-bottom: 12px;
      }
      .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
      .btn-secondary {
        background: transparent;
        color: #64748b;
        border: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: underline;
      }
    </style>
    <div class="warning-card">
      <div class="warning-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2 class="warning-title">Gunakan Google Chrome</h2>
      <p class="warning-desc">
        Beberapa fitur Al Ilmi LMS mungkin tidak berjalan maksimal di browser ini. Kami menyarankan menggunakan <b>Google Chrome</b> untuk pengalaman terbaik.
      </p>
      
      <div class="chrome-promo">
        <div class="chrome-icon"><i class="fab fa-chrome"></i></div>
        <div class="promo-text">
          ${isIOS ? 'Buka link ini di aplikasi Chrome atau tambahkan ke Home Screen via Safari.' : 'Gunakan Chrome Desktop atau Mobile untuk akses lebih lancar.'}
        </div>
      </div>

      <button id="close-warning" class="btn-primary">Saya Mengerti</button>
      <button id="dismiss-session" class="btn-secondary">Jangan ingatkan lagi sesi ini</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('close-warning').onclick = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  };

  document.getElementById('dismiss-session').onclick = () => {
    sessionStorage.setItem('browser_warning_dismissed', 'true');
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  };
}

function showInstallPromotion() {
  if (deferredPrompt) {
    const promoDiv = document.createElement('div');
    promoDiv.style.cssText = 'position:fixed; bottom:20px; left:20px; right:20px; background:#2563eb; color:white; padding:15px; border-radius:12px; z-index:9999; display:flex; justify-content:space-between; align-items:center; box-shadow:0 10px 15px rgba(0,0,0,0.2); animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);';
    promoDiv.innerHTML = `
      <div style="font-size:14px; font-weight:600;">Instal Aplikasi Al Ilmi LMS?</div>
      <div style="display:flex; gap:10px;">
        <button id="pwa-install-btn" style="background:white; color:#2563eb; border:none; padding:8px 15px; border-radius:8px; font-weight:700; cursor:pointer;">Instal</button>
        <button id="pwa-close-btn" style="background:transparent; color:white; border:1px solid white; padding:8px 15px; border-radius:8px; cursor:pointer;">Nanti</button>
      </div>
    `;
    document.body.appendChild(promoDiv);

    document.getElementById('pwa-install-btn').onclick = () => {
      promoDiv.remove();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
      });
    };

    document.getElementById('pwa-close-btn').onclick = () => {
      promoDiv.remove();
    };
  }
}

window.addEventListener('appinstalled', (evt) => {
  console.log('Al Ilmi LMS was installed.');
});

// Initialize on Load
window.addEventListener('load', () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=3')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker failed', err));
  }

  // Check for Chrome Compatibility
  setTimeout(checkBrowserCompatibility, 1500);
});
