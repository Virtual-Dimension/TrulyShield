// ==UserScript==
// @name         真·洛谷屏蔽 Truly Luogu Shield
// @namespace    https://github.com/Virtual-Dimension/TrulyShield/blob/master/TrulyLuoguShield.js
// @version	     1.3.1
// @description  Shield information you don't want to see.
// @author       ArachnidaKing
// @license      GPL-3.0
// @match        https://www.luogu.org/discuss/*
// @match		     http://www.luogu.org/discuss/*
// @grant        none
// ==/UserScript==
'use strict';

(() => {
  let isCardElement = (element) => {
    return element.className.search('am-comment') !== -1
      || element.className.search('lg-table-bg0') !== -1;
  };
  let mRequest = (medth, href, fn) => {
    let xmlHttp = new window.XMLHttpRequest();
    xmlHttp.open(medth, href, true);
    xmlHttp.onreadystatechange = () => { if (xmlHttp.readyState === 4 && xmlHttp.status === 200) { fn(xmlHttp.responseText); } };
    xmlHttp.send();
  };
  let userPromiseMap = new Map();
  let getUserByURL = (href, callback) => {
    if (!userPromiseMap.has(href)) {
      userPromiseMap.set(href, new Promise(resolve => {
        mRequest("GET", href, res => {
          let startPos = res.search("JSON.parse\(.*?(?=\);)");
          let stopPos = res.search("(?<=JSON.parse\().*?(?=\);)");
          res = window.eval(res.substring(startPos, stopPos));
          resolve({ userName: res.currentData.user.name, isShield: res.currentData.user.userRelationship === 2 });
        });
      }));
    }
    userPromiseMap.get(href).then(res => { callback(res); });
  };
  window.addEventListener('load', () => {
    let urlList = document.querySelectorAll("a[class=center]");
    for (const item of urlList) {
      let card = item;
      while (card.id !== 'app' && (!card.className || !isCardElement(card))) card = card.parentElement;
      if (card.id !== 'app') {
        ((itemElement, cardElement) => {
          getUserByURL(itemElement.href, res => {
            if (res.isShield) { cardElement.innerText = ['因内容作者为', res.userName, '，已屏蔽'].join(''); }
          });
        })(item, card);
      }
    }
  });
})();