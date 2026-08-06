// 주신당 강남점 매뉴얼 — 오프라인 지원 service worker
// 전략: index.html은 network-first(배포 갱신 즉시 반영, 오프라인 시 캐시),
//       이미지·아이콘·manifest는 cache-first(한 번 본 것은 다시 안 받음).
// 배포 시 캐시를 통째로 갈아엎으려면 VERSION만 올리면 된다.
const VERSION = 'v1';
const CACHE = 'zoosindang-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isDocument = req.mode === 'navigate' || url.pathname.endsWith('/index.html');

  if (isDocument) {
    // network-first: 새 배포를 바로 받고, 오프라인이면 캐시로
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 이미지·아이콘 등 정적 자원: cache-first + 백그라운드 저장
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
