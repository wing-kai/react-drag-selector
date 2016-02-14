"use strict";

const React = require('react');
const ReactDOM = require('react-dom');

const Shortcut = require('./shortcut');
const KeyCodeMap = require('./shortcut/key_code_map');

const Selection = React.createClass({

    getDefaultProps() {
        return {
            enable: true,
            onSelectionChange: () => {}
        }
    },

    getInitialState() {
        return {
            mouseDown: false,
            selecting: false,
            downInSelectionItem: false,

            startPoint: null,
            endPoint: null,

            appendMode: false
        }
    },

    componentWillMount() {

        let that = this;
        this.originSelectedItems = new Set();
        this.selectedItems = new Set();

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

    render() {

        const thisState = this.state;
        const className = "select-area" + (thisState.selecting ? " selecting" : "");

        return (
            <div ref="selectionArea" key="selectionArea" className={className} onMouseDown={this.handleMouseDown}>
                {this.handleRenderChildren()}
                {this.handleRenderSelectRectangle()}
            </div>
        )
    },

    componentWillReceiveProps(nextProps) {
        if (!nextProps.enable || nextProps.children.length !== this.props.children.length)
            this.selectedItems = new Set();

        this.forceUpdate();
    },

    componentWillUmmount() {
        Shortcut.removeListener([KeyCodeMap.ctrl]);
        Shortcut.removeListener([KeyCodeMap.shift]);
        Shortcut.removeListener([KeyCodeMap.ctrl, KeyCodeMap.a]);
        window.removeEventListener('keyup', this.handleSwitchAppendMode);
    },

    handleSwitchAppendMode(appendMode) {
        if (this.props.enable)
            this.setState({ appendMode });
    },

    handleMouseDown(event) {

        if (!this.props.enable)
            return;

        const thisState = this.state;
        const thisRefs = this.refs;
        const startPoint = {
            x: event.pageX,
            y: event.pageY
        };

        let downInSelectionItem = false;

        for (let key in thisRefs) {
            if (key !== "selectionArea") {
                let selectionItem = thisRefs[key];
                let selectionItemRectAngle = {
                    left: selectionItem.getBoundingClientRect().left,
                    top: selectionItem.getBoundingClientRect().top,
                    width: selectionItem.getBoundingClientRect().width,
                    height: selectionItem.getBoundingClientRect().height,
                };

                if (
                    this.handleCalcBoxIntercets({
                            top: startPoint.y,
                            left: startPoint.x,
                            width: 0,
                            height: 0
                        },
                        selectionItemRectAngle
                    )
                ) {
                    downInSelectionItem = key;
                    if (this.selectedItems.size === 0 || thisState.appendMode) {
                        this.selectedItems.add(key)
                    } else if (!this.selectedItems.has(key)) {
                        this.selectedItems = new Set([key]);
                    }
                    break;
                }
            }
        }

        this.setState({
            mouseDown: true,
            downInSelectionItem,
            startPoint,
        });

        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDownOutSide);
    },

    handleCalcBoxIntercets(boxA, boxB) {
        if (
            boxA.left <= boxB.left + boxB.width
            && boxA.left + boxA.width >= boxB.left
            && boxA.top <= boxB.top + boxB.height
            && boxA.top + boxA.height >= boxB.top
        ) {
            return true;
        }

        return false;
    },

    handleMouseMove(event) {

        const that = this;
        const thisState = this.state;
        const thisRefs = this.refs;

        const parentNode = this.refs.selectionArea;
        const startPoint = thisState.startPoint;
        const endPoint = {
            x: event.pageX,
            y: event.pageY
        };

        const selectBoxStyle = {
            left: Math.min(startPoint.x, endPoint.x) - parentNode.offsetLeft - Math.abs(parentNode.offsetLeft - parentNode.getBoundingClientRect().left),
            top: Math.min(startPoint.y, endPoint.y) - parentNode.offsetTop,
            width: Math.abs(startPoint.x - endPoint.x),
            height: Math.abs(startPoint.y - endPoint.y),
        }

        if (!thisState.mouseDown || thisState.downInSelectionItem)
            return;

        for (let key in thisRefs) {
            if (key !== "selectionArea") {
                let selectionItem = thisRefs[key];
                let selectionItemRectAngle = {
                    left: selectionItem.offsetLeft,
                    top: selectionItem.offsetTop,
                    width: selectionItem.clientWidth,
                    height: selectionItem.clientHeight,
                };

                if (this.handleCalcBoxIntercets(selectBoxStyle, selectionItemRectAngle)) {
                    this.selectedItems.add(key);
                } else if (!thisState.appendMode) {
                    this.selectedItems.delete(key);
                }
            }
        }

        this.setState({
            selecting: true,
            endPoint: {
                x: event.pageX,
                y: event.pageY
            },
            selectBoxStyle
        });
    },

    handleRenderSelectRectangle() {

        const thisState = this.state;

        if (!thisState.selecting)
            return null;

        return (
            <div className="select-rectangle" style={thisState.selectBoxStyle} />
        )
    },

    handleRenderChildren() {

        let that = this;
        let index = 0;
        let selectionItemStatus = {};
        let originSelectedItems = this.originSelectedItems;
        let selectedItems = this.selectedItems;
        let diff;

        const newChildren = React.Children.map(this.props.children, childNode => {
            let tempNode = React.cloneElement(childNode);
            let className = "selection-item" + (selectedItems.has(childNode.key) ? " selected" : "");

            selectionItemStatus[childNode.key] = selectedItems.has(childNode.key);

            return (
                <div
                    className={className}
                    ref={childNode.key ? childNode.key : index++}
                    draggable={true}
                    onDragStart={that.handleDragStart}
                >
                    {tempNode}
                </div>
            );
        });

        if (originSelectedItems.size > selectedItems.size)
            diff = new Set([...originSelectedItems].filter(x => !selectedItems.has(x)));
        else
            diff = new Set([...selectedItems].filter(x => !originSelectedItems.has(x)));

        if (diff.size) {
            this.originSelectedItems = new Set(this.selectedItems);
            this.props.onSelectionChange(selectionItemStatus);
        }


        return newChildren;
    },

    handleDragStart(event) {
        if (this.selectedItems.size) {
            event.dataTransfer.setData("dragKeyList", Array.from(this.selectedItems));
        }
        else {
            event.dataTransfer.setData("dragKeyList", [this.downInSelectionItem]);
        }
    },

    handleMouseUp() {

        if (!this.state.selecting && !this.state.downInSelectionItem)
            this.selectedItems = new Set();

        this.setState({
            mouseDown: false,
            selecting: false,
            startPoint: null,
            endPoint: null
        });

        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    },
});

module.exports = Selection;