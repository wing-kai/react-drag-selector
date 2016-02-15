"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SelectionItem = React.createClass({
    displayName: "SelectionItem",
    render: function render() {
        return React.createElement(
            "div",
            { className: "item" },
            "item " + this.props.index
        );
    }
});

var selectItemList1 = new Set([]);
var selectItemList2 = new Set([]);

for (var i = 0; i < 10 - 3; i++) {
    selectItemList1.add("item" + i);
    selectItemList2.add("item" + (i + 10));
}

var Body = React.createClass({
    displayName: "Body",
    getInitialState: function getInitialState() {
        return {};
    },
    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "panel panel-default" },
                React.createElement(
                    "div",
                    { className: "panel-heading" },
                    "Zone 1"
                ),
                React.createElement(
                    "div",
                    { className: "panel-body" },
                    React.createElement(
                        "div",
                        { className: "drag-drop-zone", onDrop: this.handleDropInZone1, onDragOver: this.handleDragOver },
                        React.createElement(
                            Selector,
                            { onSelectionChange: this.handleSelectionChange },
                            Array.from(selectItemList1).map(function (key) {
                                return React.createElement(SelectionItem, { index: key, key: key });
                            })
                        )
                    )
                )
            ),
            React.createElement(
                "div",
                { className: "panel panel-default" },
                React.createElement(
                    "div",
                    { className: "panel-heading" },
                    "Zone 2"
                ),
                React.createElement(
                    "div",
                    { className: "panel-body" },
                    React.createElement(
                        "div",
                        { className: "drag-drop-zone", onDrop: this.handleDropInZone2, onDragOver: this.handleDragOver },
                        React.createElement(
                            Selector,
                            { onSelectionChange: this.handleSelectionChange },
                            Array.from(selectItemList2).map(function (key) {
                                return React.createElement(SelectionItem, { index: key, key: key });
                            })
                        )
                    )
                )
            )
        );
    },
    handleSelectionChange: function handleSelectionChange(selectionItemsMap) {
        console.log('handleSelectionChange', selectionItemsMap);
    },
    handleDragOver: function handleDragOver(event) {
        event.preventDefault();
    },
    handleDropInZone1: function handleDropInZone1(event) {
        var newItem = event.dataTransfer.getData('dragKeyList');
        if (!newItem) return;

        newItem = newItem.split(',');
        selectItemList1 = new Set([].concat(_toConsumableArray(selectItemList1), _toConsumableArray(newItem)));
        newItem.forEach(function (key) {
            selectItemList2.delete(key);
        });
        this.forceUpdate();
        event.preventDefault();
    },
    handleDropInZone2: function handleDropInZone2(event) {
        var newItem = event.dataTransfer.getData('dragKeyList');
        if (!newItem) return;

        newItem = newItem.split(',');
        selectItemList2 = new Set([].concat(_toConsumableArray(selectItemList2), _toConsumableArray(newItem)));
        newItem.forEach(function (key) {
            selectItemList1.delete(key);
        });
        this.forceUpdate();
        event.preventDefault();
    }
});

ReactDOM.render(React.createElement(Body, null), document.getElementById('body'));