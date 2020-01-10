"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const acorde_1 = require("acorde");
const os_1 = __importDefault(require("os"));
const http_1 = __importDefault(require("http"));
const Http_1 = require("./messages/Http");
const path_1 = __importDefault(require("path"));
const actorPath = __dirname;
class WebServer {
    constructor(orchestrator, routingAddr) {
        this.orchestrator = orchestrator;
        this.server = http_1.default.createServer(this.requestHandler.bind(this));
        this.routingAddr = routingAddr;
    }
    static async create(dirname, routes, workercountOrOrchestrator) {
        let o;
        if (!workercountOrOrchestrator)
            workercountOrOrchestrator = os_1.default.cpus().length;
        if (typeof workercountOrOrchestrator === "number") {
            o = await acorde_1.Orchestrator.create(workercountOrOrchestrator);
        }
        else {
            o = workercountOrOrchestrator;
        }
        const intRoutes = await Promise.all(routes.map(async (route, index) => {
            const actorAddr = await ((route.parallel) ? o.addActorGroup(path_1.default.join(dirname, route.filepath), route.options) : o.addActor(path_1.default.join(dirname, route.filepath), route.options));
            return { path: route.path, addr: actorAddr, options: route.options };
        }));
        const addr = await o.addActorGroup(actorPath + "/actors/routing.js", { routes: intRoutes });
        return new WebServer(o, addr);
    }
    async listen(port) {
        this.server.listen(port);
    }
    async requestHandler(request, response) {
        const rawBody = [];
        request.on('error', (err) => {
            console.error(err.stack);
        });
        response.on('error', (err) => {
            console.error(err);
        });
        request.on('data', (chunk) => {
            rawBody.push(chunk);
        }).on('end', async () => {
            const body = Buffer.concat(rawBody).toString();
            const msg = {
                req: {
                    path: request.url || "/",
                    params: [],
                    query: {},
                    method: Http_1.parseHttpMethod(request.method),
                    headers: request.headers,
                    body: body
                },
                res: {
                    headers: {},
                    status: 404,
                    body: null,
                }, status: Http_1.HttpMessageStatus.PROCESSING
            };
            try {
                var resp = await this.orchestrator.sendMessage(this.routingAddr, msg);
                for (const header in resp.res.headers) {
                    if (resp.res.headers.hasOwnProperty(header)) {
                        const element = resp.res.headers[header];
                        response.setHeader(header, element);
                    }
                }
                response.statusCode = resp.res.status;
                response.end(resp.res.body);
            }
            catch (ex) {
                console.error(ex);
                response.statusCode = 500;
                response.end("internal server error");
            }
        });
    }
}
exports.WebServer = WebServer;
