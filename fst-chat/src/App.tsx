import {  useState,useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
function App() {
  const [count2, setCount2] = useState(0)
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLButtonElement>(null) 
 return (
    <>
      <div >
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button ref={ref} onClick={() => setCount2((count) => count + 1)}>
	  count2 is {count2}	
	</button>
	<button onClick={() => {console.log(ref.current?.innerText)}}>
					maj {count}

	</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

