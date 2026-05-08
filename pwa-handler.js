let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  
  console.log('✅ PWA beforeinstallprompt event fired!');
  
  setTimeout(() => {
    showInstallPromotion();
  }, 3000);
});

// Diagnostic logs
console.log('PWA Status Check:');
console.log('- Protocol:', window.location.protocol);
console.log('- Service Worker support:', 'serviceWorker' in navigator);
console.log('- Manifest link:', !!document.querySelector('link[rel="manifest"]'));

if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.warn('⚠️ PWA requirements: Site MUST be served via HTTPS or localhost to be installable.');
}

function showInstallPromotion() {
  console.log('Prompting for installation...');
  
  // For debugging, we remove the "pwa_dismissed" check
  // localStorage.removeItem('pwa_dismissed'); 

  if (deferredPrompt) {
    // Show a custom UI instead of a simple confirm()
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'position:fixed; bottom:20px; left:20px; right:20px; background:#2563eb; color:white; padding:15px; border-radius:12px; z-index:9999; display:flex; justify-content:space-between; align-items:center; box-shadow:0 10px 15px rgba(0,0,0,0.2); animation: slideUp 0.5s ease;';
    debugDiv.innerHTML = `
      <div style="font-size:14px; font-weight:600;">Instal Aplikasi Al Ilmi LMS?</div>
      <div style="display:flex; gap:10px;">
        <button id="pwa-install-btn" style="background:white; color:#2563eb; border:none; padding:8px 15px; border-radius:8px; font-weight:700; cursor:pointer;">Instal</button>
        <button id="pwa-close-btn" style="background:transparent; color:white; border:1px solid white; padding:8px 15px; border-radius:8px; cursor:pointer;">Nanti</button>
      </div>
    `;
    document.body.appendChild(debugDiv);

    document.getElementById('pwa-install-btn').onclick = () => {
      debugDiv.remove();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
      });
    };

    document.getElementById('pwa-close-btn').onclick = () => {
      debugDiv.remove();
    };
  } else {
    console.log('deferredPrompt is null. PWA might not be installable yet.');
  }
}

window.addEventListener('appinstalled', (evt) => {
  console.log('Al Ilmi LMS was installed.');
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.log('Service Worker registration failed', err));
  });
}
