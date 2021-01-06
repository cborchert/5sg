// init turbolinks

/* eslint-disable no-undef */
// Allowing undefined variables since we're assuming that turbolinks was included in the html shell
if (typeof window !== 'undefined' && typeof window.Turbolinks !== 'undefined') {
  Turbolinks.start();
}
/* eslint-enable no-undef */
