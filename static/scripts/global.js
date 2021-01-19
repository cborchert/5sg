document.addEventListener('DOMContentLoaded', function () {
  // handle lazy-loaded blur up images
  document.querySelectorAll('img[data-lazy-src]').forEach((img) => {
    img.src = img.getAttribute('data-lazy-src');
    img.removeAttribute('data-lazy-src');
  });
});
