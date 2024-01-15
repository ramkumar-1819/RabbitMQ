let pubChannel = null;
let offlinePubQueue = [];

// Start Publisher.
function startPublisher(amqpConn, closeOnErr) {
  amqpConn.createConfirmChannel(function (err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function (err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function () {
      console.log("[AMQP] channel closed");
    });

    pubChannel = ch;
    while (true) {
      const pendingMessages = offlinePubQueue.shift();
      if (pendingMessages) {
        const [exchange, routingKey, content] = pendingMessages;
        publish(exchange, routingKey, content);
      } else {
        break;
      }
    }
  });
}

// Message Publish.
function publish(exchange, routingKey, content) {
  try {
    pubChannel.publish(
      exchange,
      routingKey,
      content,
      { persistent: true },
      function (err, ok) {
        if (err) {
          console.error("[AMQP] publish", err);
          offlinePubQueue.push([exchange, routingKey, content]);
          pubChannel.connection.close();
        }
      }
    );
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

module.exports = { publish, startPublisher };
