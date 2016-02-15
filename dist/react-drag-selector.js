(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Selector = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var ReactDOM = (typeof window !== "undefined" ? window['ReactDOM'] : typeof global !== "undefined" ? global['ReactDOM'] : null);

var Shortcut = require('./shortcut');
var KeyCodeMap = require('./shortcut/key_code_map');

var selectRectangleWrap = document.createElement('div');

var SelectRectangle = React.createClass({
    displayName: 'SelectRectangle',
    getDefaultProps: function getDefaultProps() {
        return {
            style: {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            }
        };
    },
    render: function render() {
        return React.createElement('div', { className: 'select-rectangle', style: this.props.style });
    }
});

var Selection = React.createClass({
    displayName: 'Selection',
    getDefaultProps: function getDefaultProps() {
        return {
            enable: true,
            onSelectionChange: function onSelectionChange() {}
        };
    },
    getInitialState: function getInitialState() {
        return {
            mouseDown: false,
            selecting: false,
            downInSelectionItem: false,

            startPoint: null,
            endPoint: null,

            startScreenPoint: null,
            endScreenPoint: null,

            appendMode: false
        };
    },
    componentWillUpdate: function componentWillUpdate() {
        this.handleRenderSelectRectangle();
    },
    componentWillMount: function componentWillMount() {

        var that = this;

        this.originSelectedItems = new Set();
        this.selectedItems = new Set();

        document.body.appendChild(selectRectangleWrap);

        Shortcut.addListener([KeyCodeMap.ctrl], this.handleSwitchAppendMode.bind(this, true));
        Shortcut.addListener([KeyCodeMap.shift], this.handleSwitchAppendMode.bind(this, true));
        // 全选监听
        // Shortcut.addListener([KeyCodeMap.ctrl, KeyCodeMap.a], () => {
        //     for (let key in that.refs) {
        //         if (key !=="selectionArea")
        //             that.selectedItems.add(key);
        //     }
        //     that.forceUpdate();
        // });
        window.addEventListener('keyup', this.handleSwitchAppendMode.bind(this, false));
    },
    render: function render() {

        var thisState = this.state;
        var className = "select-area" + (thisState.selecting ? " selecting" : "");

        return React.createElement(
            'div',
            { ref: 'selectionArea', key: 'selectionArea', className: className, onMouseDown: this.handleMouseDown },
            this.handleRenderChildren()
        );
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (!nextProps.enable || nextProps.children.length !== this.props.children.length) this.selectedItems = new Set();

        this.forceUpdate();
    },
    componentWillUmmount: function componentWillUmmount() {
        Shortcut.removeListener([KeyCodeMap.ctrl]);
        Shortcut.removeListener([KeyCodeMap.shift]);
        Shortcut.removeListener([KeyCodeMap.ctrl, KeyCodeMap.a]);
        window.removeEventListener('keyup', this.handleSwitchAppendMode);
        ReactDOM.unmountComponentAtNode(selectRectangleWrap);
        document.body.removeChild(selectRectangleWrap);
    },
    handleSwitchAppendMode: function handleSwitchAppendMode(appendMode) {
        if (this.props.enable) this.setState({ appendMode: appendMode });
    },
    handleMouseDown: function handleMouseDown(event) {

        if (!this.props.enable) return;

        var thisState = this.state;
        var thisRefs = this.refs;

        var startPoint = {
            x: event.pageX,
            y: event.pageY
        };
        var startScreenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var downInSelectionItem = false;

        for (var key in thisRefs) {
            if (key !== "selectionArea") {
                var BCR = thisRefs[key].getBoundingClientRect();
                var selectionItemRectAngle = {
                    left: BCR.left,
                    top: BCR.top,
                    width: BCR.width,
                    height: BCR.height
                };

                if (this.handleCalcBoxIntercets({
                    top: startScreenPoint.y,
                    left: startScreenPoint.x,
                    width: 0,
                    height: 0
                }, selectionItemRectAngle)) {
                    downInSelectionItem = key;
                    if (this.selectedItems.size === 0 || thisState.appendMode) {
                        this.selectedItems.add(key);
                    } else if (!this.selectedItems.has(key)) {
                        this.selectedItems = new Set([key]);
                    }
                    break;
                }
            }
        }

        this.setState({
            mouseDown: true,
            downInSelectionItem: downInSelectionItem,
            startPoint: startPoint,
            startScreenPoint: startScreenPoint
        });

        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
    },
    handleCalcBoxIntercets: function handleCalcBoxIntercets(boxA, boxB) {
        if (boxA.left <= boxB.left + boxB.width && boxA.left + boxA.width >= boxB.left && boxA.top <= boxB.top + boxB.height && boxA.top + boxA.height >= boxB.top) {
            return true;
        }

        return false;
    },
    handleMouseMove: function handleMouseMove(event) {

        var thisState = this.state;
        var thisRefs = this.refs;

        var parentNode = this.refs.selectionArea;
        var startPoint = thisState.startPoint;
        var startScreenPoint = thisState.startScreenPoint;


        var endPoint = {
            x: event.pageX,
            y: event.pageY
        };
        var endScreenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var selectBoxStyle = {
            left: Math.min(startPoint.x, endPoint.x),
            top: Math.min(startPoint.y, endPoint.y),
            width: Math.abs(startPoint.x - endPoint.x),
            height: Math.abs(startPoint.y - endPoint.y)
        };
        var selectRectangleInScreen = {
            left: Math.min(startScreenPoint.x, endScreenPoint.x),
            top: Math.min(startScreenPoint.y, endScreenPoint.y),
            width: Math.abs(startScreenPoint.x - endScreenPoint.x),
            height: Math.abs(startScreenPoint.y - endScreenPoint.y)
        };

        if (!thisState.mouseDown || thisState.downInSelectionItem) return;

        for (var key in thisRefs) {
            if (key !== "selectionArea") {

                var BCR = thisRefs[key].getBoundingClientRect();
                var selectionItemRectAngle = {
                    left: BCR.left,
                    top: BCR.top,
                    width: BCR.width,
                    height: BCR.height
                };

                if (this.handleCalcBoxIntercets(selectRectangleInScreen, selectionItemRectAngle)) {
                    this.selectedItems.add(key);
                } else if (!thisState.appendMode) {
                    this.selectedItems.delete(key);
                }
            }
        }

        this.setState({
            selecting: true,
            endPoint: endPoint,
            endScreenPoint: endScreenPoint,
            selectBoxStyle: selectBoxStyle
        });
    },
    handleRenderSelectRectangle: function handleRenderSelectRectangle() {

        var thisState = this.state;
        var startPoint = thisState.startPoint;
        var endPoint = thisState.endPoint;


        if (!thisState.selecting || !thisState.mouseDown || thisState.downInSelectionItem) {
            ReactDOM.unmountComponentAtNode(selectRectangleWrap);
            return null;
        }

        var selectRectangleStyle = {
            left: Math.min(startPoint.x, endPoint.x),
            top: Math.min(startPoint.y, endPoint.y),
            width: Math.abs(startPoint.x - endPoint.x),
            height: Math.abs(startPoint.y - endPoint.y)
        };

        ReactDOM.render(React.createElement(SelectRectangle, { style: selectRectangleStyle }), selectRectangleWrap);
    },
    handleRenderChildren: function handleRenderChildren() {

        var that = this;
        var index = 0;
        var selectionItemStatus = {};
        var originSelectedItems = this.originSelectedItems;
        var selectedItems = this.selectedItems;
        var diff = undefined;

        var newChildren = React.Children.map(this.props.children, function (childNode) {
            var tempNode = React.cloneElement(childNode);
            var className = "selection-item" + (selectedItems.has(childNode.key) ? " selected" : "");

            selectionItemStatus[childNode.key] = selectedItems.has(childNode.key);

            return React.createElement(
                'div',
                {
                    className: className,
                    ref: childNode.key ? childNode.key : index++,
                    draggable: true,
                    onDragStart: that.handleDragStart
                },
                tempNode
            );
        });

        if (originSelectedItems.size > selectedItems.size) diff = new Set([].concat(_toConsumableArray(originSelectedItems)).filter(function (x) {
            return !selectedItems.has(x);
        }));else diff = new Set([].concat(_toConsumableArray(selectedItems)).filter(function (x) {
            return !originSelectedItems.has(x);
        }));

        if (diff.size) {
            this.originSelectedItems = new Set(this.selectedItems);
            this.props.onSelectionChange(selectionItemStatus);
        }

        return newChildren;
    },
    handleDragStart: function handleDragStart(event) {
        event.dataTransfer.setData("dragKeyList", this.selectedItems.size ? Array.from(this.selectedItems) : [this.downInSelectionItem]);
    },
    handleMouseUp: function handleMouseUp() {

        if (!this.state.selecting && !this.state.downInSelectionItem) this.selectedItems = new Set();

        this.setState({
            mouseDown: false,
            selecting: false,
            startPoint: null,
            endPoint: null,
            downInSelectionItem: false
        });

        ReactDOM.unmountComponentAtNode(selectRectangleWrap);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }
});

module.exports = Selection;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./shortcut":2,"./shortcut/key_code_map":3}],2:[function(require,module,exports){
(function (global){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Immutable = (typeof window !== "undefined" ? window['Immutable'] : typeof global !== "undefined" ? global['Immutable'] : null);
var listenList = Immutable.Map({});
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
    listenList = listenList.update(keyGroup, function (handlerList) {
        return handlerList ? handlerList.push(handler) : Immutable.List([handler]);
    });
};

/**
 * 添加快捷键监听
 * kg            Array    快捷键组合
 * deleteHandler Function 要被移除监听的事件（如果为空则移除该快捷键组合的所有事件）
 **/
var removeListener = function removeListener(kg, deleteHandler) {
    var keyGroup = getKeyGroupString(kg);
    if (listenList.has(keyGroup)) {
        if (deleteHandler) {
            listenList = listenList.update(keyGroup, function (handlerList) {
                return handlerList.filter(function (handler) {
                    return handler !== deleteHandler;
                });
            });
        } else {
            listenList = listenList.delete(keyGroup);
        }
    }
};

window.addEventListener('keydown', function (event) {
    keyDownGroup = Array.from(new Set([].concat(_toConsumableArray(keyDownGroup), [event.keyCode])));
    var keyDownGroupString = getKeyGroupString(keyDownGroup);
    if (listenList.has(keyDownGroupString)) {
        listenList.get(keyDownGroupString).forEach(function (handler) {
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
"use strict";

module.exports = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    break: 19,
    capsLock: 20,
    escape: 27,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36,
    leftArrow: 37,
    upArrow: 38,
    rightArrow: 39,
    downArrow: 40,
    insert: 45,
    delete: 46,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    window: {
        left: 91,
        right: 92
    },
    meta: {
        left: 91,
        right: 93
    },
    select: 93,
    numPad0: 96,
    numPad1: 97,
    numPad2: 98,
    numPad3: 99,
    numPad4: 100,
    numPad5: 101,
    numPad6: 102,
    numPad7: 103,
    numPad8: 104,
    numPad9: 105,
    multiply: 106,
    add: 107,
    subtract: 109,
    decimalPoint: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numLock: 144,
    scrollLock: 145,
    semicolon: 186,
    equalSign: 187,
    comma: 188,
    dash: 189,
    period: 190,
    forwardSlash: 191,
    graveAccent: 192,
    openBracket: 219,
    backSlash: 220,
    closeBraket: 221,
    singleQuote: 222
};
},{}]},{},[1])(1)
});