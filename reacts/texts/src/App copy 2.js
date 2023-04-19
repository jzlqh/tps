import { useState } from "react";
import useCallbackState from "./hooks/useCallbackState";
import useDidUpdateEffect from './hooks/useDidUpdateEffect'
const App = () => {
  const [val, setVal] = useState({})
  const [data, setData] = useCallbackState(1);

  const handleClick = () => {
    setData(data + 1, function (data) {
      console.log("callback", data)
    })
  }
  const changeVal = () => {
    setVal({
      test: 'val'
    })
  }
  useDidUpdateEffect(() => {
    if (val) {
      console.log('val')
    }
  }, val)

  return (
    <div>
      <button onClick={handleClick}>+1</button>
      <button onClick={changeVal}>change val</button>
    </div>
  )
}
export default App


// http://localhost:8002/fiat/otc/item/online

// http://localhost:8002/fiat/otc/order/list/download 

