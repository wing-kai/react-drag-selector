"use strict";

let listenList = {}
let keyDownGroup = [];

const getKeyGroupString = keyGroupArray => {
    let keyGroup = Array.from(keyGroupArray);
    keyGroup.sort();
    return keyGroup.join(',');
}

/**
 * 添加快捷键监听
 * kg      Array    快捷键组合
 * handler Function 被监听的事件
 **/
const addListener = (kg, handler) => {
    let keyGroup = getKeyGroupString(kg);
    listenList[keyGroup] = handler
};

/**
 * 添加快捷键监听
 * kg            Array    快捷键组合
 * deleteHandler Function 要被移除监听的事件（如果为空则移除该快捷键组合的所有事件）
 **/
const removeListener = (kg, deleteHandler) => {
    let keyGroup = getKeyGroupString(kg);
    if (listenList.has(keyGroup)) {
        if (deleteHandler) {
            listenList = listenList.update(
                keyGroup,
                handlerList => handlerList.filter(handler => handler !== deleteHandler)
            );
        } else {
            listenList = listenList.delete(keyGroup);
        }
    }
}

window.addEventListener('keydown', event => {
    keyDownGroup = Array.from(new Set([...keyDownGroup, event.keyCode]))
    let keyDownGroupString = getKeyGroupString(keyDownGroup);
    if (listenList.has(keyDownGroupString)) {
        listenList.get(keyDownGroupString).forEach(
            handler => { handler() }
        );
    }
});

window.addEventListener('keyup', event => {
    keyDownGroup.pop();
});

module.exports = {
    addListener,
    removeListener
}