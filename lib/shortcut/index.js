"use strict";

var listenList = {};
var keyDownGroup = [];

var getKeyGroupString = function getKeyGroupString(keyGroupArray) {
    var keyGroup = Array.from(keyGroupArray);
    keyGroup.sort();
    return keyGroup.join(',');
};

/**
 * 添加快捷键监听
 * kg      Array    快捷键组合
 * handler Function 被监听的事件
 **/
var addListener = function addListener(kg, handler) {
    var keyGroup = getKeyGroupString(kg);
    listenList[keyGroup] = handler;
};

/**
 * 添加快捷键监听
 * kg            Array    快捷键组合
 * deleteHandler Function 要被移除监听的事件（如果为空则移除该快捷键组合的所有事件）
 **/
var removeListener = function removeListener(kg, deleteHandler) {
    var keyGroup = getKeyGroupString(kg);
    if (keyGroup in listenList) {
        if (deleteHandler) {
            listenList[keyGroup] = listenList[keyGroup].filter(function (handler) {
                return handler !== deleteHandler;
            });
        } else {
            delete listenList[keyGroup];
        }
    }
};

window.addEventListener('keydown', function (event) {
    keyDownGroup = Array.from(new Set([].concat(keyDownGroup, [event.keyCode])));
    var keyDownGroupString = getKeyGroupString(keyDownGroup);
    if (keyDownGroupString in listenList) {
        listenList[keyDownGroupString].forEach(function (handler) {
            handler();
        });
    }
});

window.addEventListener('keyup', function (event) {
    keyDownGroup.pop();
});

module.exports = {
    addListener: addListener,
    removeListener: removeListener
};