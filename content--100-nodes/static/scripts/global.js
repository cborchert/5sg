// init turbolinks

/* eslint-disable no-undef */
// Allowing undefined variables since we're assuming that turbolinks was included in the html shell
if (typeof window !== 'undefined' && typeof window.Turbolinks !== 'undefined') {
  Turbolinks.start();

  // init hightlightJS on page load and when we visit a new page
  const hightlight = () => {
    document.querySelectorAll('pre code').forEach(hljs.highlightBlock);
  };
  document.addEventListener('DOMContentLoaded', hightlight);
  document.addEventListener('turbolinks:load', hightlight);
}
/* eslint-enable no-undef */
