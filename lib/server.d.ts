/// <reference types="node" />
import { Route } from './route';
import { Orchestrator, Addr } from "acorde";
import http from "http";
export declare class WebServer {
    orchestrator: Orchestrator;
    server: http.Server;
    routingAddr: Addr;
    private constructor();
    static create(dirname: string, routes: Array<Route>, workercount?: number): Promise<WebServer>;
    listen(port: number): Promise<void>;
    requestHandler(request: http.IncomingMessage, response: http.OutgoingMessage): Promise<void>;
}
