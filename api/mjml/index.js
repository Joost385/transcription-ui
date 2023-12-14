const Fastify = require("fastify");
const mjml2html = require("mjml");

const fastify = Fastify({ logger: true });

fastify.post("/render", function handler(request, reply) {
    const { html } = mjml2html(request.body);
    reply.header("Content-Type", "text/html");
    reply.send(html);
})

const PORT = 3000;

fastify.listen({ host: "0.0.0.0", port: PORT })
    .then(() => console.log(`MJML Server lisening on Port ${PORT}`))
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
