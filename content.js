const SHOW_MORE_LOCATIONS_BUTTON_SELECTOR = 'button.w-100.css-1vrq36y.e7cdgnz1';
const BUTTON_PARENT_SELECTOR = 'div.css-1fttcpj.e18c1r7j43:has(.locations)';
const ENABLE_URL_REGEX = /^https:\/\/vrchat\.com\/home(|\/|\/locations\/?)$/;
const TARGET_PAGE_NAME_LIST = [
  'home',
  'location',
];
const OBSERVER_CONFIG = Object.freeze({
  childList: true,
  subtree: true,
});

let currentUrl = location.href;
let nextClickButton = null;
let scrollElement = null;
let isSetButtonParentObserver = false;
let isSetScrollEvent = false;

// ボタン自動押下に必要な処理の実行、ページURLの監視
const bodyObserver = new MutationObserver(() => {
  console.log({ // TODO: test
    nextClickButton,
    scrollElement,
    isSetButtonParentObserver,
    isSetScrollEvent,
  });

  // 別ページに遷移した場合は各フラグ・値をリセット
  if (location.href !== currentUrl) {
    console.log('reset'); // TODO: test

    nextClickButton = null;
    scrollElement = null;
    isSetButtonParentObserver = false;
    isSetScrollEvent = false;

    currentUrl = location.href;
  }

  if (!location.href.match(ENABLE_URL_REGEX) || isSetButtonParentObserver && isSetScrollEvent) {
    return;
  }

  // 自動押下するボタンの親要素を取得
  if (!isSetButtonParentObserver) {
    /*
     * TODO: home→locations, locations→homeの遷移後に再取得する際、
     * 取得時点では存在していてもその後要素が置き換わってしまいボタンが取得できなくなるのを修正
     */
    const buttonParent = document.querySelector(BUTTON_PARENT_SELECTOR);
    if (buttonParent == null) {
      return;
    }

    observeButtonParent(buttonParent);
    isSetButtonParentObserver = true;
  }

  // スクロールする要素（メインカラム）の取得、スクロール時のイベントを設定
  if (!isSetScrollEvent) {
    scrollElement = document.querySelector('.content-scroll');
    if (scrollElement == null) {
      return;
    }

    scrollElement.addEventListener('scroll', () => {
      if (nextClickButton == null) {
        return;
      }

      const buttonRect = nextClickButton.getBoundingClientRect();
      const isButtonVisible = window.innerHeight - buttonRect.top >= 0;

      if (isButtonVisible) {
        nextClickButton.click();
      }
    });

    isSetScrollEvent = true;
  }
});

bodyObserver.observe(document.body, OBSERVER_CONFIG);

const observeButtonParent = (observeTarget) => {
  const observer = new MutationObserver(() => {
    const showMoreLocationsButton = observeTarget.querySelector(SHOW_MORE_LOCATIONS_BUTTON_SELECTOR);
    if (showMoreLocationsButton == null) {
      return;
    }

    nextClickButton = showMoreLocationsButton;
  });

  // TODO: ページ遷移時にdisconnect()しなくてもよいのか？
  observer.observe(observeTarget, OBSERVER_CONFIG);
};
