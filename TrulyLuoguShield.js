// ==UserScript==
// @name		 真·洛谷屏蔽 Truly Luogu Shield
// @namespace	 https://github.com/Virtual-Dimension/TrulyShield/blob/master/TrulyLuoguShield.js
// @version	     1.0.2
// @description  Shield information you don't want to see.
// @author	     ArachnidaKing
// @license      GPL-3.0
// @match		 https://www.luogu.org/discuss/*
// @match		 http://www.luogu.org/discuss/*
// @grant		 none
// ==/UserScript==
'use strict';

(() => {
    let mRequest = (medth, href, fn) => {
        let xmlHttp = new window.XMLHttpRequest();
        xmlHttp.open(medth, href, true);
        xmlHttp.onreadystatechange = () => { if (xmlHttp.readyState == 4 && xmlHttp.status == 200) { fn(xmlHttp.responseText); } };
        xmlHttp.send();
    };
    window.addEventListener('load', () => {
        let urlList = document.querySelectorAll("a[class=center]");
        for (const item of urlList) {
            ((itemElement) => {
                mRequest("GET", itemElement.href, res => {
                    let prePos = res.search("JSON.parse\(.*?(?=\);)");
                    let nxtPos = res.search("(?<=JSON.parse\().*?(?=\);)");
                    res = window.eval(res.substr(prePos, nxtPos - prePos));
                    if (res.currentData.user.userRelationship === 2) { itemElement.parentNode.parentNode.innerText = ['因内容作者为用户', itemElement.innerText, '，已屏蔽'].join(''); }
                });
            })(item);
        }
    });
})();