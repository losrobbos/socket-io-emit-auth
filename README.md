# socket-io-emit-auth

The given sample shows how you can add JWT authentication to your Socket IO sessions, without a library like socketio-jwt.

The sample shows how you can:

- pass in a JWT token on connection, using the auth object (see client/src/App.js)
- evaluate the JWT token on connection (see server.js)
- evaluate the JWT token on each emit to the server, using socket middleware (see server.js)

Difference to normal REST auth:

- we pass the JWT token just ONCE (on connection), not on each request
- if the token is not valid, the connection will be prevented right away
- on each emit, we re-evaluate the originally passed token (if it has expired)
- in case of expiry, we emit an error event to the client & abort the connection

That is it. 

Enjoy JWT protection for your holy message exchanges

