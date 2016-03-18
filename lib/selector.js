"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var React = require('react');
var ReactDOM = require('react-dom');

var Shortcut = require('./shortcut');
var KeyCodeMap = require('./shortcut/key_code_map');

var selectRectangleWrap = document.createElement('div');

var SelectRectangle = function SelectRectangle(props) {
    return React.createElement('div', { className: 'select-rectangle', style: props.style });
};

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
        var diff = void 0;

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