(() => {
  'use strict';

  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const menuLabel = document.querySelector('.menu-label');
  const navigation = document.querySelector('#site-nav');
  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'portfolio-theme';
  const pageLinks = Array.from(document.querySelectorAll('a[href]')).filter((link) => /^(index|about|project|future)\.html(?:\?.*)?$/.test(link.getAttribute('href')));
  let chosenTheme = null;

  // 로컬 파일이나 저장소가 차단된 환경에서도 화면과 전환은 동작한다.
  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') chosenTheme = savedTheme;
  } catch {
    // 저장된 값이 없으면 시스템 테마를 따른다.
  }

  // file:// 환경에서 페이지별 저장소가 분리되더라도 링크로 테마를 전달한다.
  const themeFromLink = new URLSearchParams(window.location.search).get('theme');
  if (themeFromLink === 'light' || themeFromLink === 'dark') {
    chosenTheme = themeFromLink;
    try {
      window.localStorage.setItem(storageKey, chosenTheme);
    } catch {
      // 링크에 포함된 테마만으로도 다음 페이지에서 선택을 이어갈 수 있다.
    }
  }

  function updatePageLinks(theme) {
    pageLinks.forEach((link) => {
      const page = link.getAttribute('href').split('?')[0];
      link.setAttribute('href', `${page}?theme=${theme}`);
    });
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    updatePageLinks(theme);
  }

  applyTheme(chosenTheme || (darkQuery.matches ? 'dark' : 'light'));
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    chosenTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(chosenTheme);
    // 새로고침 시 오래된 주소의 테마 값이 선택을 되돌리지 않게 한다.
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('theme', chosenTheme);
      window.history.replaceState(null, '', currentUrl.href);
    } catch {
      // 주소 변경을 허용하지 않는 로컬 환경에서도 화면과 페이지 링크는 유지한다.
    }
    try {
      window.localStorage.setItem(storageKey, chosenTheme);
    } catch {
      // 저장 실패는 현재 화면의 테마 전환에 영향을 주지 않는다.
    }
  });

  darkQuery.addEventListener('change', (event) => {
    if (!chosenTheme) applyTheme(event.matches ? 'dark' : 'light');
  });

  function setMenu(open, returnFocus = false) {
    const expanded = mobileQuery.matches && open;
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuLabel.textContent = expanded ? '닫기' : '메뉴';
    navigation.hidden = mobileQuery.matches && !expanded;
    if (returnFocus) menuButton.focus();
  }

  function updateLayout() {
    const active = document.activeElement;
    // 너비 변경으로 현재 초점이 숨겨진 요소에 남는 것을 방지한다.
    const focusMovesToMenu = mobileQuery.matches && navigation.contains(active);
    const focusMovesToNav = !mobileQuery.matches && active === menuButton;
    menuButton.hidden = !mobileQuery.matches;
    setMenu(false, focusMovesToMenu);
    if (focusMovesToNav) navigation.querySelector('a').focus();
  }

  root.classList.add('js-ready');
  updateLayout();
  mobileQuery.addEventListener('change', updateLayout);
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });

  // 본문 건너뛰기 링크의 기본 이동을 유지하고 키보드 초점을 전달한다.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      setMenu(false);
      if (target) target.focus({ preventScroll: true });
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let navigationTimer = null;
  let destination = null;

  // 링크의 기본 동작을 남겨 두고, 일반 클릭에서만 짧은 나가기 효과를 준다.
  pageLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || (typeof event.button === 'number' && event.button !== 0) ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.getAttribute('target') === '_blank' || link.getAttribute('download') !== null ||
          reducedMotion.matches) return;

      let nextUrl;
      try {
        nextUrl = new URL(link.getAttribute('href'), window.location.href).href;
      } catch {
        return;
      }
      if (nextUrl === window.location.href) return;

      event.preventDefault();
      destination = nextUrl;
      // 연속 클릭에서는 마지막으로 선택한 페이지를 한 번만 연다.
      if (navigationTimer !== null) return;
      root.classList.add('page-leaving');
      navigationTimer = window.setTimeout(() => {
        navigationTimer = null;
        window.location.assign(destination);
      }, 360);
    });
  });

  // 뒤로 가기로 복원된 화면에 나가기 상태가 남지 않게 한다.
  window.addEventListener('pageshow', () => {
    if (navigationTimer !== null) window.clearTimeout(navigationTimer);
    navigationTimer = null;
    destination = null;
    root.classList.remove('page-leaving');
  });

})();
