// NoCap MoCap offline cache: everything is cached on first visit, then served even with no internet.
const VERSION = 'nocap-v30';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-512.png',
  'vendor/three/build/three.module.js',
  'vendor/three/examples/jsm/controls/OrbitControls.js',
  'vendor/three/examples/jsm/exporters/GLTFExporter.js',
  'vendor/three/examples/jsm/utils/BufferGeometryUtils.js',
  'vendor/three/examples/jsm/utils/TextureUtils.js',
  'vendor/three/examples/jsm/loaders/FBXLoader.js',
  'vendor/three/examples/jsm/loaders/GLTFLoader.js',
  'vendor/three/examples/jsm/libs/fflate.module.js',
  'vendor/three/examples/jsm/curves/NURBSCurve.js',
  'vendor/three/examples/jsm/curves/NURBSUtils.js',
  'vendor/tasks-vision/vision_bundle.mjs',
  'vendor/tasks-vision/wasm/vision_wasm_internal.js',
  'vendor/tasks-vision/wasm/vision_wasm_internal.wasm',
  'vendor/tasks-vision/wasm/vision_wasm_nosimd_internal.js',
  'vendor/tasks-vision/wasm/vision_wasm_nosimd_internal.wasm',
  'vendor/mp4box.all.min.js',
  'models/pose_landmarker_heavy.task',
  'models/pose_landmarker_full.task',
  'models/hand_landmarker.task',
];
// large / optional files are cached the first time they are used
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(err => console.warn('precache miss', u, err))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.url.endsWith('/index.html');
  if (isPage) { // network first for the app page (so updates arrive), cache when offline
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); }
    return r;
  })));
});
