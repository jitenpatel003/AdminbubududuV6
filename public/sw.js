const CACHE_NAME = "bd-admin-v1";
const URLS_TO_CACHE = ["/", "/index.html", "/static/js/main.chunk.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Always go to network for Firebase calls
  if (event.request.url.includes("firestore") || event.request.url.includes("firebase")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
```

---

## Step 5 — Add Icons

You need two PNG icon files in your `public/` folder:
- `icon-192.png` (192×192 pixels)
- `icon-512.png` (512×512 pixels)

The easiest way on mobile: go to [https://realfavicongenerator.net](https://realfavicongenerator.net), upload any image (like your panda emoji screenshot), and download the generated icons. Rename them to `icon-192.png` and `icon-512.png`, then upload to your CodeSandbox `public/` folder.

---

## Step 6 — Deploy to Netlify

Since you're on mobile, do this:

1. Push all changes to your GitHub repo
2. Go to [netlify.com](https://netlify.com) on your phone
3. Connect your GitHub repo if not already connected
4. Build settings should be:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Click **Deploy site**

---

## Step 7 — Connect Your Custom Domain

Once Netlify deploys successfully:

1. In Netlify → go to **Domain settings**
2. Click **Add custom domain** → type `adminbubududu.com`
3. Netlify will give you two options. The easiest is to use **Netlify DNS**. Click "Use Netlify DNS"
4. Netlify will show you 4 nameservers like:
```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
