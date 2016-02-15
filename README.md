# About React-Drag-Selector
react框选组件，支持批量框选拖放

# Demo

[View Demo](http://wing-kai.github.io/react-drag-selector/)

# npm

```bash
npm install react-drag-selector
```

# Usage

```jsx
import React from 'react'
import Selector from './selector'

// code...

const Component = React.createClass({

  render() {
    return (
      <div
        onDrop={this.handleDrop}
        onDragOver={this.handleDragOver}
      >
        <Selector onSelectionChange={this.handleSelectionChange}>
          {[
            <SelectionItem key={1} />,
            <SelectionItem key={2} />,
            <SelectionItem key={3} />
          ]}
        </Selector>
      </div>
    )
  },

  handleSelectionChange(selectionItemsMap) {
    // code...
  },

  handleDragOver(event) {
    event.preventDefault();
  },

  handleDrop(event) {
    let newItems = event.dataTransfer.getData('dragKeyList');

    // code...

    event.preventDefault();
  }
});

```
