import { IntRoute } from './../route';
import { HttpMesssage } from './../messages/Http';
import { ActorModule, Handler, Addr, SendMessageFunction } from "acorde";
declare class ParsedRoute {
    parts: string[];
    staticParts: string[];
    partCount: number;
    staticPartCount: number;
    addr: Addr;
    constructor(intRoute: IntRoute);
    matches(url: string): {
        matches: boolean;
        options: any;
    };
}
declare class RoutingActor implements ActorModule, Handler<HttpMesssage> {
    routes: Array<IntRoute>;
    parsedRoutes: Array<ParsedRoute>;
    start(props: any): Promise<void>;
    handle(msg: HttpMesssage, sendMessage: SendMessageFunction<HttpMesssage>): Promise<HttpMesssage | undefined>;
}
declare const _default: RoutingActor;
export = _default;
