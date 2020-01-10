import { HttpMesssage } from './../messages/Http';
import { ActorModule, Handler, SendMessageFunction } from "acorde";
declare class RoutingActor implements ActorModule, Handler<HttpMesssage> {
    start(props: any): Promise<void>;
    handle(msg: HttpMesssage, sendMessage: SendMessageFunction<any>): Promise<HttpMesssage | undefined>;
}
declare const _default: RoutingActor;
export = _default;
