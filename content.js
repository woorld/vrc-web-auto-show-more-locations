const SHOW_MORE_LOCATIONS_BUTTON_SELECTOR = 'button.w-100.css-1vrq36y.e7cdgnz1';
const BUTTON_PARENT_SELECTOR = 'div.css-1fttcpj.e18c1r7j44:has(.locations)';
const ENABLE_URL_REGEX = /^https:\/\/vrchat\.com\/home(|\/|\/locations\/?)$/;
const OBSERVER_CONFIG = Object.freeze({
  childList: true,
  subtree: true,
});

let currentUrl = location.href;

let isSetButtonParentObserver = false;
let isSetScrollEvent = false;

let buttonParent = null;
let nextClickButton = null;
let scrollElement = null;

let buttonParentObserver = null;

// ボタン自動押下に必要な処理の実行、ページURLの監視
const bodyObserver = new MutationObserver(() => {
  // 別ページに遷移した場合は各フラグ・値をリセット
  if (location.href !== currentUrl) {
    isSetButtonParentObserver = false;
    isSetScrollEvent = false;
    buttonParent = null;
    nextClickButton = null;
    scrollElement = null;
    // buttonParentObserverはリセットしない

    currentUrl = location.href;
  }

  if (!location.href.match(ENABLE_URL_REGEX)) {
    return;
  }

  if (isSetButtonParentObserver && isSetScrollEvent) {
    // ボタンの親要素の取得後にその要素がなくなった場合のフォロー（/home→/home/locationsまたはその逆の遷移で発生）
    if (document.contains(buttonParent)) {
      return;
    }

    buttonParent = document.querySelector(BUTTON_PARENT_SELECTOR);
    if (buttonParent == null) {
      return;
    }

    buttonParentObserver.disconnect();
    observeButtonParent(buttonParent);
  }

  // 自動押下するボタンの親要素を取得
  if (!isSetButtonParentObserver) {
    buttonParent = document.querySelector(BUTTON_PARENT_SELECTOR);
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

    scrollElement.addEventListener('scroll', onScroll);
    isSetScrollEvent = true;
  }
});

bodyObserver.observe(document.body, OBSERVER_CONFIG);

// NOTE: 監視対象を引数に取ってるけど、トップレベルで宣言してるから不要かも？
const observeButtonParent = (observeTarget) => {
  buttonParentObserver = new MutationObserver(() => onChangeButtonParent(observeTarget));
  buttonParentObserver.observe(observeTarget, OBSERVER_CONFIG);
};

const onChangeButtonParent = (observeTarget) => {
  const showMoreLocationsButton = observeTarget.querySelector(SHOW_MORE_LOCATIONS_BUTTON_SELECTOR);
  if (showMoreLocationsButton == null) {
    return;
  }

  nextClickButton = showMoreLocationsButton;
};

const onScroll = () => {
  if (nextClickButton == null) {
    return;
  }

  const buttonRect = nextClickButton.getBoundingClientRect();
  const isButtonVisible = window.innerHeight - buttonRect.top >= 0;

  if (isButtonVisible) {
    nextClickButton.click();
  }
};
