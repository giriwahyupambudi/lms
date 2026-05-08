let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  
  // Optionally, show a custom install button or notification
  console.log('PWA install prompt is ready');
  
  // If you want to automatically show it after a delay
  setTimeout(() => {
    showInstallPromotion();
  }, 5000);
});

function showInstallPromotion() {
  // Check if user has already dismissed the prompt recently
  const dismissed = localStorage.getItem('pwa_dismissed');
  if (dismissed) {
    const lastDismissed = new Date(dismissed).getTime();
    const now = new Date().getTime();
    // Don't show again for 3 days (3 * 24 * 60 * 60 * 1000)
    if (now - lastDismissed < 259200000) return;
  }

  if (deferredPrompt) {
    const confirmInstall = confirm("Apakah Anda ingin menginstal aplikasi Al Ilmi LMS di perangkat ini agar lebih praktis?");
    if (confirmInstall) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
          localStorage.setItem('pwa_dismissed', new Date().toISOString());
        }
        deferredPrompt = null;
      });
    } else {
      // User clicked "Cancel" on the confirm box
      localStorage.setItem('pwa_dismissed', new Date().toISOString());
    }
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
