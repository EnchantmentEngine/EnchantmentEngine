export let ResourceCache: Cache | null = null
if ('caches' in self) {
  caches.open('ir-engine-cache').then((c) => {
    ResourceCache = c
  })
}
