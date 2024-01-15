const queue_server_url = "amqp://localhost:5672";
const workers = [
  {
    queue: "queue-dev-test",
    routingKey: "developer",
    exchange: "Dev Test",
  },
];

module.exports =  { queue_server_url, workers }