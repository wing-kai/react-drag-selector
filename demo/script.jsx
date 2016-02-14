"use strict";

const SelectionItem = React.createClass({
    render() {
        return (
            <div className="item">{"item " + this.props.index}</div>
        )
    }
});

let selectItemList1 = new Set([]);
let selectItemList2 = new Set([]);

for (let i = 0; i < 10 - 5; i++) {
    selectItemList1.add("item" + i);
}

for (let i = 10; i < 20 - 5; i++) {
    selectItemList2.add("item" + i);
}

const Body = React.createClass({
    getInitialState() {
        return {}
    },

    render() {
        return (
            <div className="container" onSelectStart={this.handleSelect}>
                <h3>Zone 1</h3>
                <div className="drag-drop-zone" onDrop={this.handleDropInZone1} onDragOver={this.handleDragOver}>
                    <Selector onSelectionChange={this.handleSelectionChange}>
                        {Array.from(selectItemList1).map(key => (
                            <SelectionItem index={key} key={key} />
                        ))}
                    </Selector>
                </div>
                <h3>Zone 2</h3>
                <div className="drag-drop-zone" onDrop={this.handleDropInZone2} onDragOver={this.handleDragOver}>
                    <Selector onSelectionChange={this.handleSelectionChange}>
                        {Array.from(selectItemList2).map(key => (
                            <SelectionItem index={key} key={key} />
                        ))}
                    </Selector>
                </div>
            </div>
        )
    },

    handleSelectionChange(selectionItemsMap) {
    },

    handleSelect(event) {
        console.log('handleSelect')
        event.preventDefault();
        return false;
    },

    handleDragOver(event) {
        event.preventDefault();
    },

    handleDropInZone1(event) {
        let newItem = event.dataTransfer.getData('dragKeyList');
        if (!newItem)
            return;

        newItem = newItem.split(',');
        selectItemList1 = new Set([...selectItemList1, ...newItem]);
        newItem.forEach(key => {
            selectItemList2.delete(key);
        });
        this.forceUpdate();
        event.preventDefault();
    },

    handleDropInZone2(event) {
        let newItem = event.dataTransfer.getData('dragKeyList');
        if (!newItem)
            return;

        newItem = newItem.split(',');
        selectItemList2 = new Set([...selectItemList2, ...newItem]);
        newItem.forEach(key => {
            selectItemList1.delete(key);
        });
        this.forceUpdate();
        event.preventDefault();
    }
})

ReactDOM.render(
    <Body />,
    document.getElementById('body')
)