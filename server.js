const express = require('express');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');

// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const colours = ["red", "blue", "green", "purple"];

  function pickColour() {
  return colours[Math.floor(Math.random()*colours.length)];
}

  wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({
      type: "userColour",
      colour: pickColour()
    }));
    wss.broadcast(JSON.stringify({
      type: "userCountChange",
      userCount: wss.clients.size
    }));

    ws.on('message', function incoming(messObj) {
      let input = JSON.parse(messObj);
       switch(input.type) {
      case "postMessage":
        input.type = "incomingMessage";
        input.id = uuid.v4();
       wss.broadcast(JSON.stringify(input));
        break;
      case "postNotification":
        input.type = "incomingNotification";
        input.id = uuid.v4();
        wss.broadcast(JSON.stringify(input));
        break;
      default:
        throw new Error("Error");
    }
    });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    wss.broadcast(JSON.stringify({
      type: "userCountChange",
      userCount: wss.clients.size
    }));
  })
});