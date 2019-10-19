import { Route, IntRoute } from './route';

import {Orchestrator, Addr} from "acorde";
import os from "os";
import http from "http";
import { HttpMesssage, HttpMessageStatus, HttpMethod, parseHttpMethod } from "./messages/Http";
import path from "path";

const actorPath = __dirname;


export class WebServer{
    orchestrator: Orchestrator;
    server: http.Server;
    routingAddr: Addr;

    private constructor(orchestrator: Orchestrator, routingAddr: Addr){
        this.orchestrator = orchestrator;
        this.server = http.createServer(this.requestHandler.bind(this));
        this.routingAddr = routingAddr;
    }

    static async create(dirname: string, routes: Array<Route>, workercount ?:number): Promise<WebServer>{
        if(!workercount) workercount = os.cpus().length;
        const o = await Orchestrator.create(workercount);

        const intRoutes: Array<IntRoute> = await Promise.all(routes.map(async(route, index) => {
            const actorAddr = await ((route.parallel)?o.addActorGroup(path.join(dirname, route.filepath), route.options):o.addActor(path.join(dirname, route.filepath), route.options));
            return {path: route.path, addr: actorAddr, options: route.options}
        }));

        const addr = await o.addActorGroup(actorPath+"/actors/routing.js", {routes: intRoutes});
        return new WebServer(o, addr);
    }

    async listen(port: number){
        this.server.listen(port);
    }

    async requestHandler(request: http.IncomingMessage, response: http.OutgoingMessage) {
        const rawBody: Array<any> = [];
       
        request.on('error', (err) => {
            console.error(err.stack);
        });
        response.on('error', (err) => {
            console.error(err);
        });

        request.on('data', (chunk) => {
            rawBody.push(chunk);
        }).on('end', async() => {
            const body = Buffer.concat(rawBody).toString();
            const msg: HttpMesssage = {
                req: {
                    path: request.url || "/",
                    params: [],
                    query: {},
                    method: parseHttpMethod(request.method),
                    headers: request.headers as {[header: string]: string},
                    body: body
                }, 
                res: {
                    headers: {},
                    status: 404,
                    body: null,
                }, status: HttpMessageStatus.PROCESSING};
    
            try{
                var resp = await this.orchestrator.sendMessage(this.routingAddr, msg) as HttpMesssage;
                for (const header in resp.res.headers) {
                    if (resp.res.headers.hasOwnProperty(header)) {
                        const element = resp.res.headers[header];
                        response.setHeader(header,element);
                    }
                }
                (response as any).statusCode = resp.res.status;
                response.end(resp.res.body);
            }catch (ex) {
                console.error(ex);
                (response as any).statusCode = 500;
                response.end("internal server error");
            }
           
    
    
        });
        
    }
}
