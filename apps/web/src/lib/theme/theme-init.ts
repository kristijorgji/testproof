export const THEME_STORAGE_KEY = 'theme';
export const THEME_COOKIE = 'theme';

export const THEME_INIT_SCRIPT = `(function(){
  try {
    var key = '${THEME_STORAGE_KEY}';
    var stored = localStorage.getItem(key);
    var cookie = document.cookie.split('; ').find(function (part) { return part.indexOf('${THEME_COOKIE}=') === 0; });
    var fromCookie = cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
    var mode = stored || fromCookie || 'system';
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') mode = 'system';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  } catch (_) {}
})();`;
