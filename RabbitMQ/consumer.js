const { workers } = require("./config");

let closeOnErr;
// Start Consumer.
function startWorker(amqpConn, errorHandler) {
  closeOnErr = errorHandler;
  // Create a channel for queue
  amqpConn.createChannel(function (err, ch) {
    if (closeOnErr(err)) return;
    ch.on("error", function (err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function () {
      console.log("[AMQP] channel closed");
    });

    ch.prefetch(10);

    workers.forEach((worker) => {
      const { queue } = worker;
      // Connect to queue
      ch.assertQueue(queue, { durable: true }, function (err, _ok) {
        if (closeOnErr(err)) return;
        // Consume incoming messages
        ch.consume(queue, processMsg, { noAck: false }); // Note: Write different worker handler based on the queue.
        console.log("Worker is started");
      });

      // A worker that acks messages only if processed successfully
      function processMsg(msg) {
        work(msg, function (ok) {
          try {
            if (ok) ch.ack(msg);
            else ch.reject(msg, true);
          } catch (e) {
            closeOnErr(e);
          }
        });
      }
    });
  });
}

function work(msg, cb) {
  console.log("Received Message From Queue", msg.content.toString());
  cb(true);
}

module.exports = { startWorker };
