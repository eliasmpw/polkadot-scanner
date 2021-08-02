import React from "react";
import { Button } from "antd";
import "./App.less";

function App(): React.ReactElement {
  return (
    <div className="App">
      <Button type="primary">Hello</Button>
      <Button type="default">Test</Button>
    </div>
  );
}

export default App;
