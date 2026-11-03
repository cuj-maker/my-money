// MY MONEY 오프라인 지원: 앱 화면 파일을 아이폰에 저장해 두고, 인터넷이 없어도 열리게 함
// (기록은 여기 저장하지 않음 — 기록은 앱 안의 저장소에 있음)
const CACHE = 'mymoney-03b73a16';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mymoney-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // 시세·환율은 항상 인터넷에서
  if (req.mode === 'navigate') {
    // 화면: 인터넷이 되면 최신 버전, 안 되면 저장해 둔 버전
    e.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
