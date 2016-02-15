"use strict";

const React = require('react');
const ReactDOM = require('react-dom');

const Shortcut = require('./shortcut');
const KeyCodeMap = require('./shortcut/key_code_map');

const selectRectangleWrap = document.createElement('div');

const SelectRectangle = React.createClass({
    getDefaultProps() {
        return {
            style: {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            }
        }
    },

    render() {
        return (
            <div className="select-rectangle" style={this.props.style} />
        )
    }
});

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

            startScreenPoint: null,
            endScreenPoint: null,

            appendMode: false
        }
    },

    componentWillUpdate() {
        this.handleRenderSelectRectangle();
    },

    componentWillMount() {

        const that = this;

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

    render() {

        const thisState = this.state;
        const className = "select-area" + (thisState.selecting ? " selecting" : "");

        return (
            <div ref="selectionArea" key="selectionArea" className={className} onMouseDown={this.handleMouseDown}>
                {this.handleRenderChildren()}
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
        ReactDOM.unmountComponentAtNode(selectRectangleWrap);
        document.body.removeChild(selectRectangleWrap);
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
        const startScreenPoint = {
            x: event.clientX,
            y: event.clientY
        }

        let downInSelectionItem = false;

        for (let key in thisRefs) {
            if (key !== "selectionArea") {
                const BCR = thisRefs[key].getBoundingClientRect();
                const selectionItemRectAngle = {
                    left: BCR.left,
                    top: BCR.top,
                    width: BCR.width,
                    height: BCR.height,
                };

                if (
                    this.handleCalcBoxIntercets({
                            top: startScreenPoint.y,
                            left: startScreenPoint.x,
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
            startScreenPoint
        });

        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
    },

    handleCalcBoxIntercets(boxA, boxB) {
        if (
            boxA.left <= boxB.left + boxB.width &&
            boxA.left + boxA.width >= boxB.left &&
            boxA.top <= boxB.top + boxB.height &&
            boxA.top + boxA.height >= boxB.top
        ) {
            return true;
        }

        return false;
    },

    handleMouseMove(event) {

        const thisState = this.state;
        const thisRefs = this.refs;

        const parentNode = this.refs.selectionArea;
        const {startPoint, startScreenPoint} = thisState;

        const endPoint = {
            x: event.pageX,
            y: event.pageY
        };
        const endScreenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        const selectBoxStyle = {
            left: Math.min(startPoint.x, endPoint.x),
            top: Math.min(startPoint.y, endPoint.y),
            width: Math.abs(startPoint.x - endPoint.x),
            height: Math.abs(startPoint.y - endPoint.y),
        }
        const selectRectangleInScreen = {
            left: Math.min(startScreenPoint.x, endScreenPoint.x),
            top: Math.min(startScreenPoint.y, endScreenPoint.y),
            width: Math.abs(startScreenPoint.x - endScreenPoint.x),
            height: Math.abs(startScreenPoint.y - endScreenPoint.y),
        }

        if (!thisState.mouseDown || thisState.downInSelectionItem)
            return;

        for (let key in thisRefs) {
            if (key !== "selectionArea") {

                const BCR = thisRefs[key].getBoundingClientRect();
                const selectionItemRectAngle = {
                    left: BCR.left,
                    top: BCR.top,
                    width: BCR.width,
                    height: BCR.height,
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
            endPoint,
            endScreenPoint,
            selectBoxStyle
        });
    },

    handleRenderSelectRectangle() {

        const thisState = this.state;
        const { startPoint, endPoint } = thisState;

        if (!thisState.selecting || !thisState.mouseDown || thisState.downInSelectionItem) {
            ReactDOM.unmountComponentAtNode(selectRectangleWrap);
            return null;
        }

        const selectRectangleStyle = {
            left: Math.min(startPoint.x, endPoint.x),
            top: Math.min(startPoint.y, endPoint.y),
            width: Math.abs(startPoint.x - endPoint.x),
            height: Math.abs(startPoint.y - endPoint.y),
        }

        ReactDOM.render(
            <SelectRectangle style={selectRectangleStyle} />,
            selectRectangleWrap
        );
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
        event.dataTransfer.setData(
            "dragKeyList",
            this.selectedItems.size ? Array.from(this.selectedItems) : [this.downInSelectionItem]
        );
    },

    handleMouseUp() {

        if (!this.state.selecting && !this.state.downInSelectionItem)
            this.selectedItems = new Set();

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
    },
});

module.exports = Selection;