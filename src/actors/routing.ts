import { IntRoute } from './../route';
import { HttpMesssage, HttpMessageStatus } from './../messages/Http';
import { ActorModule, Handler, Addr, SendMessageFunction, ActorMessage } from "acorde";
import { Route } from '../route';



class ParsedRoute{
    parts: string[];
    staticParts: string[];
    partCount: number;
    staticPartCount: number;
    addr: Addr;

    constructor(intRoute: IntRoute){
        let path = intRoute.path.trim();
        path = path.startsWith("/")?path.substring(1):path;
        this.parts = path.split("/");
        this.partCount = this.parts.length;
        this.staticParts = this.parts.filter(p => p !== "**");
        this.staticPartCount = this.staticParts.length;
        this.addr = intRoute.addr;
    }

    matches(url:string): {matches: boolean, options:any} {
        let path = url.trim();
        path = path.startsWith("/")?path.substring(1):path;
        path = path.endsWith("/")?path.substring(0, path.length - 1):path;

        const urlParts = path.split("/");
        const urlPartCount = urlParts.length;
        const routePartCount = this.partCount;
        const options: any = {};

        const matchesPart = (urlPart: string, templatePart: string) => {
            if(templatePart.startsWith("$")){
                if(urlPart){
                    options[templatePart.substring(1)] = urlPart;
                    return true;
                }else{
                    return false;
                }
            }
            if(templatePart == urlPart) return true;
            if(templatePart === "*" || templatePart === "**") return true;
            if(!templatePart && !urlPart) return true;

            if(templatePart.trim() == urlPart.trim()) return true;
            if(!templatePart || !urlPart) return false;
            if(!templatePart.trim() && !urlPart.trim()) return true;
            if(!templatePart.trim() || !urlPart.trim()) return false;
            return false;
        }
       
        if(urlPartCount === routePartCount){ 
            const matches = (urlParts as Array<any>).reduce((prv, current, index) => prv && matchesPart(current, this.parts[index]), true) as boolean;
            return {matches, options};
        }else{
            if(urlPartCount > routePartCount){
                if(this.parts[routePartCount - 1] === "**"){

                    while(urlParts.length > routePartCount) urlParts.pop();

                    const matches = (urlParts as Array<any>).reduce((prv, current, index) => prv && matchesPart(current, this.parts[index]), true) as boolean;
                    return {matches, options};
                }else{
                    return {matches: false, options : {}};
                }
            }else{
                if(urlPartCount >= this.staticPartCount){
                    while(urlParts.length > this.staticPartCount) urlParts.pop();
                    const matches = (urlParts as Array<any>).reduce((prv, current, index) => prv && matchesPart(current, this.parts[index]), true) as boolean;
                    return {matches, options};
                }else{
                    return {matches: false, options : {}};
                }
            }
        }

    }
}


class RoutingActor implements ActorModule, Handler<HttpMesssage>{
    
    routes: Array<IntRoute> = [];
    parsedRoutes: Array<ParsedRoute> = [];

    async start(props: any){
        //if(!props.routes) throw new Error("no routes provided to worker");
        //if(!Array.isArray(props.routes)) throw new Error("invalid route format provided to worker");
        this.routes = props.routes as Array<IntRoute>;
        this.parsedRoutes = this.routes.map(r => new ParsedRoute(r));
        return;
    } 

    async handle(msg: HttpMesssage, sendMessage: SendMessageFunction<HttpMesssage>): Promise<HttpMesssage | undefined> {
        let reqStatus = msg.req;
        let resStatus = msg.res;
        let status = msg.status;
        const [url, queryString] = msg.req.path.split("?");
        reqStatus.query = {};
        if(queryString){
            const pairs = queryString.split("&");
            pairs.forEach(qu => {
                const [name, value] = qu.split("=");
                reqStatus.query[name] = value;
            });
        }
        reqStatus.path = url;

        for (let index = 0; index < this.parsedRoutes.length; index++) {
            const route = this.parsedRoutes[index];
            let match = route.matches(url);
            if(match.matches){
                var enhancedRequest = {...reqStatus};
                enhancedRequest.params = match.options;
                const routeResult = await sendMessage(route.addr, {req: enhancedRequest, res: resStatus, status }, true) as ActorMessage<HttpMesssage>;
                if(routeResult.error){
                    throw new Error(routeResult.error);
                }
                if(routeResult.returnValue){
                    status = HttpMessageStatus.FINISHED;
                    routeResult.content.status = status;
                    return routeResult.content;
                }else{
                    if(!routeResult.content){
                        return routeResult as any;
                    }
                    status = HttpMessageStatus.PROCESSING;
                    reqStatus = routeResult.content.req;
                    resStatus = routeResult.content.res;
                }
            }
        }
        msg.res.body = "404 - Path: "+ url + " was not found on this server! \n Routes: " + this.routes.map(r => r.path).join(", ");
        return;
    }
}

export = new RoutingActor();
