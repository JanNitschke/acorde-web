const acordeWeb = require("./../lib/mod");


/***
 * @type {Array<acordeWeb.Route>} routes
 */
const routes = [
    {path: "/$first/und/$second", filepath:"hello.js", options: {}, parallel: false}
]

async function start(){
    var server = await acordeWeb.WebServer.create(__dirname, routes);
    server.listen(8080);
    console.log("started!")
}

start();