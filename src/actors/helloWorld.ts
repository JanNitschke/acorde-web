import { IntRoute } from './../route';
import { HttpMesssage } from './../messages/Http';
import { ActorModule, Handler, SendMessageFunction } from "acorde";


class RoutingActor implements ActorModule, Handler<HttpMesssage>{
   
    async start(props: any){
        
    } 

    async handle(msg: HttpMesssage, sendMessage: SendMessageFunction<any>): Promise<HttpMesssage | undefined> {
        
        return;
    }
}

export = new RoutingActor();
