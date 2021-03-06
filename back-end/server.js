require("dotenv").config();
const express = require("express"),
  app = express(),
  PORT = process.env.PORT || 8080,
  path = require("path"),
  myServer = app.listen(PORT, () =>
    console.log("Server is listening on port " + PORT)
  );

const socketIO = require("socket.io");
const ioServer = socketIO(myServer);
const roomModel = require("./models/room");
const mongoose = require("mongoose");
const events = require("./events");

app.use(express.static(path.resolve(__dirname, "../client/public")));
app.use(express.static(path.resolve(__dirname, "../dist")));

mongoose
  .connect("mongodb+srv://nrajiv1997:rajiv1234@cluster0.dn8rj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB is connected..."))
  .catch((err) => {
    throw err;
  });

/****************************************************************
 ****************************************************************/

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/public/index.html"));
});

ioServer.on("connection", (socket) => {
  socket.on("host", (data) => events.host(data, socket, ioServer));
  socket.on("join", (data) => {
    roomModel.findOne({ _id: data.roomId }, async (err, room) => {
      if (!room) {
        socket.emit("responseForRoom", {
          success: false,
        });
      } else {
        events.join(data, socket, ioServer);
      }
    });
  });
});
