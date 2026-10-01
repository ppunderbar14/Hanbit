(() => {
  // 스타일을 읽기 전에 테마를 정해 페이지 이동 중 밝은 배경이 잠깐 보이는 일을 줄인다.
  let theme = null;
  try {
    const fromLink = new URLSearchParams(window.location.search).get('theme');
    if (fromLink === 'light' || fromLink === 'dark') theme = fromLink;
  } catch {
    // 주소를 읽을 수 없으면 저장된 선택을 확인한다.
  }
  if (!theme) {
    try {
      const saved = window.localStorage.getItem('portfolio-theme');
      if (saved === 'light' || saved === 'dark') theme = saved;
    } catch {
      // 저장소를 사용할 수 없으면 CSS의 시스템 테마 설정을 따른다.
    }
  }
  if (theme) document.documentElement.dataset.theme = theme;
})();
