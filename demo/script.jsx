"use strict";

const SelectionItem = props => (
    <div className="item">{'item ' + props.index}</div>
)

let selectItemList1 = new Set();
let selectItemList2 = new Set();

for (let i = 0; i < 10 - 3; i++) {
    selectItemList1.add("item" + i);
    selectItemList2.add("item" + (i + 10));
}

const Body = React.createClass({
    render() {
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">Drop Zone 1</div>
                    <div className="panel-body">
                        <div className="drag-drop-zone" onDrop={this.handleDropInZone1} onDragOver={this.handleDragOver}>
                            <Selector onSelectionChange={this.handleSelectionChange}>
                                {
                                    Array.from(selectItemList1).map(key => (
                                        <SelectionItem index={key} key={key} />
                                    ))
                                }
                            </Selector>
                        </div>
                    </div>
                </div>
                <div className="panel panel-default">
                    <div className="panel-heading">Drop Zone 2</div>
                    <div className="panel-body">
                        <div className="drag-drop-zone" onDrop={this.handleDropInZone2} onDragOver={this.handleDragOver}>
                            <Selector onSelectionChange={this.handleSelectionChange}>
                                {
                                    Array.from(selectItemList2).map(key => (
                                        <SelectionItem index={key} key={key} />
                                    ))
                                }
                            </Selector>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    handleSelectionChange(selectionItemsMap) {
        console.log('handleSelectionChange', selectionItemsMap);
    },
    handleDragOver(event) {
        event.preventDefault();
    },
    handleDropInZone1(event) {
        let newItem = event.dataTransfer.getData('dragKeyList');
        
        if (!newItem) return;

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
        
        if (!newItem) return;

        newItem = newItem.split(',');
        selectItemList2 = new Set([...selectItemList2, ...newItem]);

        newItem.forEach(function (key) {
            selectItemList1.delete(key);
        });

        this.forceUpdate();
        event.preventDefault();
    }
});

ReactDOM.render(
    <Body />,
    document.getElementById('body')
);