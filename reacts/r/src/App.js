import { useState } from 'react';

import './App.css';

function App() {
  const [num, setNum] = useState(0)
  return (
    <div className="App">
      <p>{num}</p>
      <button onClick={() => {
        setNum(num + 1)
      }}>btns</button>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
