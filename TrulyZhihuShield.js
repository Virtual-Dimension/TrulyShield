// ==UserScript==
// @name         真·知乎屏蔽 Truly Zhihu Shield
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  Shield information you don't want to see.
// @author       Ciyang
// @license      GPL-3.0
// @match        https://www.zhihu.com/*
// @match        http://www.zhihu.com/*
// @grant        none
// ==/UserScript==

'use strict';

(function () {
  let getContentElement = () => { return document.getElementById('root'); };
  let isCard = (className) => {
    return className.search('NestComment') !== -1
      || className.search('Card') !== -1
      || className.search('List-item') !== -1
      || className.search('openComment') !== -1;
  };
  let mRequest = (method, href, fn) => {
    let xmlHttp = new window.XMLHttpRequest();
    xmlHttp.open(method, href, true);
    xmlHttp.onreadystatechange = () => { if (xmlHttp.readyState == 4 && xmlHttp.status == 200) { fn(xmlHttp.responseText); } };
    xmlHttp.send();
  };
  let userShieldMap = new Map();
  let excludeEditor = () => { return window.location.href.search("www.zhihu.com/people/") !== -1 || window.location.href.search("www.zhihu.com/org/") !== -1; };
  let getUserShielded = (username, href, callback) => {
    if (!userShieldMap.has(username)) {
      mRequest('get', href, (resText) => {
        let res = (resText.search('已屏蔽') !== -1);
        userShieldMap.set(username, res);
        callback(res);
      });
    } else {
      callback(userShieldMap.get(username));
    }
  };
  let checkShielded = () => {
    let userList = document.getElementsByClassName('UserLink-link');
    for (const user of userList) {
      if (user.innerText && user.href) {
        let card = user;
        while (card.id !== 'root' && (!card.className || !isCard(card.className))) { card = card.parentElement; }
        if (card.id !== 'root') {
          ((userElement, cardElement) => {
            let url = new URL(userElement.href, window.location.href);
            getUserShielded(userElement.innerText, url.href, res => {
              if (res) { cardElement.innerHTML = ['<div>内容作者', userElement.innerText, '已被拉入黑名单</div>'].join(''); }
            });
          })(user, card);
        }
      }
    }
  };
  let timer;
  let moCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type == 'childList' && mutation.addedNodes && mutation.addedNodes.length) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(checkShielded, 50);
      }
    }
  };
  let observerConfig = { childList: true, subtree: true };
  let openFlag = false;
  let checkFullPageModal = () => {
    if (!openFlag && document.getElementsByClassName('Modal--fullPage').length) {
      openFlag = true;
      let modal = document.getElementsByClassName('Modal--fullPage')[0];
      let observer = new window.MutationObserver(moCallback);
      observer.observe(modal, observerConfig);
      if (timer) clearTimeout(timer);
      timer = setTimeout(checkShielded, 50);
    }
    if (!document.getElementsByClassName('Modal--fullPage').length) { openFlag = false; }
  }
  window.addEventListener('load', (event) => {
    if (excludeEditor()) { userShieldMap.set(document.getElementsByClassName('ProfileHeader-name')[0].innerText, false); }
    if (timer) clearTimeout(timer);
    timer = setTimeout(checkShielded, 50);
    let targetNode = getContentElement();
    let observer = new window.MutationObserver(moCallback);
    observer.observe(targetNode, observerConfig);
    setInterval(checkFullPageModal, 10);
  });
})();
