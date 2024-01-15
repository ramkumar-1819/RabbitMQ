const express = require("express");
const app = express();
const { port } = require("./config");

// Start RabbitMQ.
const rabbitMQ = require("./RabbitMQ");

app.listen(port, () => console.log(`Server Listening to port ${port}`));
