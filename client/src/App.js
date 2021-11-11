import { useEffect, useRef, useState } from 'react'
import './App.css';
import socketIo from 'socket.io-client'

const MESSAGE_API = "http://localhost:5000"

function App() {

  const socketRef = useRef()
  const [msgs, setMsgs] = useState([])
  const [loggedUser, setLoggedUser] = useState( )

  useEffect(() => {

    if(!loggedUser) {
      return
    }

    // socketRef.current = socketIo( MESSAGE_API , { query: "token=ey12345" })
    socketRef.current = socketIo( MESSAGE_API , { auth: { token: loggedUser.token }})

    socketRef.current.on("connect", () => {
      console.log("Connected to Socket Server...")
    })
    socketRef.current.on("error", (err) => {
      console.log("Error occurred", err)
    })

    return () => socketRef.current && socketRef.current.disconnect()

  }, [loggedUser])

  useEffect(() => {

    if(!loggedUser && !socketRef.current ) {
      console.log("Socket Ref does not exist so far...")
      return // return on no instance
    }

    // socketRef.current.connected

    console.log("Setting up listener, yay.")

    socketRef.current.on("message", (msgNew) => {
      console.log("Received message", msgNew)
      setMsgs([...msgs, msgNew])
    })

    return () => socketRef.current && socketRef.current.off("message")

  }, [loggedUser, msgs])

  const sendMsg = () => {
    if(!socketRef.current) return
    socketRef.current.emit("message", { user: "Umberto", text: "Hahaaa" })
  }

  const login = async () => {
    // make fetch call
    const response = await fetch(`${MESSAGE_API}/login`)
    const user = await response.json()

    setLoggedUser( user )
  }

  return (
    <div className="App">
      <header className="App-header">
        {
          loggedUser ?
          <>
            <h2>Socket IO</h2>
            { msgs.map((msg => (
              <div key={msg.time}>{ msg.text }</div>
            ))) }
            <button onClick={ sendMsg }>Send</button>
          </>
          : <button onClick= { login }>Login</button>
        }
      </header>
    </div>
  );
}

export default App;
