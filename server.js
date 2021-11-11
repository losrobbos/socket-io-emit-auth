import express, { response } from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import faker from 'faker'
import jwt from 'jsonwebtoken'

const app = express() // create API instance

const PORT = 5000
const JWT_SECRET = "daHolySecretio"

const httpServer = app.listen( PORT, () => {
  console.log( `API with Socket Server started on http://localhost:${PORT}` )
})

app.use( cors() )

app.get("/login", (req, res) => {

  const fakeUser = {
    _id: faker.datatype.uuid(),
    username: faker.internet.userName(),
  }

  const token = jwt.sign(fakeUser, JWT_SECRET, { expiresIn: '1m' })

  console.log("LOGGED IN: ", { ...fakeUser, token })
  res.json({ ...fakeUser, token })
})

// hook in socket server on top of API / httpServer
const io = new Server( httpServer, { cors: { origin: "*" } } )

// validate incoming token on connection
io.use((socket, next) => {

  const token = socket.handshake.auth?.token 

  if(!token) {
    console.log(socket.handshake.auth)
    const err = new Error("not authorized");
    err.data = { content: "Please retry later" }; // additional details
    return next(err);
  }

  try {
    const decodedUser = jwt.verify( token, JWT_SECRET )
    next()
  }
  catch(error) {
    const err = new Error(err.message);
    return next(err);
  }

});

io.on("connection", (socket) => {

  console.log("A Client connected: ", socket.id)

  // SOCKET specific middleware
  // => check if specified token is still valid / not expired
  // => otherwise abort emit
  socket.use(([ event, ...args ], next) => {
    console.log("[MIDDLEWARE]")

    try {
      const token = socket.handshake.auth?.token 
      jwt.verify( token, JWT_SECRET )
      next()
    }
    catch(error) {
      console.log("-- AUTH ERROR: ", error.message)
      return next(new Error(error.message));
    }
  });

  // server side error handler ( triggered by next(err) calls in middleware )
  socket.on("error", (err) => {

    socket.emit("error", err.message); // forward error to client / browser too!
    socket.disconnect(true); // disconnect the client / kick that unauthenticated dude out
  });
  
  socket.on("message", (msg) => {
    console.log("Received: ", msg)
    io.emit("message", { ...msg, time: Date.now(), sender: socket.id }) // forward msg to everyone
    // socket.broadcast.emit("message", { ...msg, sender: socket.id }) // forward msg to everyone excl sender
  })

  socket.on("disconnect", (reason) => {
    console.log(`A Client disconnected: ${socket?.id}`)
  })

})