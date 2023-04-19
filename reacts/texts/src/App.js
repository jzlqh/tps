import { useState } from 'react'
import { Button } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

const App = () => {
  const [num, setNum] = useState(0)
  return (
    <div className="App" >
      <Button type="primary" onClick={() => {
        setNum(10)
      }}>Button {num}</Button>
    </div >
  )

}

export default App;