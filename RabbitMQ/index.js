const amqp = require("amqplib/callback_api");
let amqpConn = null;
const { queue_server_url } = require("./config");
const { startPublisher, publish } = require("./publisher");
const { startWorker } = require("./consumer");
const { workers } = require("./config");

// Connection Setup.
function start() {
  amqp.connect(queue_server_url + "?heartbeat=60", function (err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function () {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err);
  amqpConn.close();
  return true;
}

// Start Publisher and Consumer when connected.
function whenConnected() {
  startPublisher(amqpConn, closeOnErr);
  startWorker(amqpConn, closeOnErr);
}

// For Testing Purpose I'm Publish a Message.
setInterval(function () {
  const { exchange, routingKey } = workers[0];
  const message = Buffer.from("Hey Ram You learned RabbitMQ man!", "utf-8");
  publish(exchange, routingKey, message);
}, 1000);

start();

module.exports = { amqpConn };
