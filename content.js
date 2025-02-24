const SHOW_MORE_LOCATIONS_BUTTON_SELECTOR = 'button.w-100.css-1vrq36y.e7cdgnz1';
const BUTTON_PARENT_SELECTOR = 'div.mt-5.css-1fttcpj.e18c1r7j43:has(.locations)';
const OBSERVER_CONFIG = Object.freeze({
  childList: true,
  subtree: true,
});

const bodyObserver = new MutationObserver(() => {
  const buttonParent = document.querySelector(BUTTON_PARENT_SELECTOR);
  if (buttonParent == null) {
    return;
  }

  observeButtonParent(buttonParent);
  bodyObserver.disconnect();
});

bodyObserver.observe(document.body, OBSERVER_CONFIG);

const observeButtonParent = (observeTarget) => {
  const observer = new MutationObserver(() => {
    const showMoreLocationsButton = observeTarget.querySelector(SHOW_MORE_LOCATIONS_BUTTON_SELECTOR);
    if (showMoreLocationsButton == null) {
      return;
    }

    // TODO: スクロールしてボタンが描画範囲内に入った際にclick()を実行するように変更
    showMoreLocationsButton.click();
  });

  observer.observe(observeTarget, OBSERVER_CONFIG);
};
