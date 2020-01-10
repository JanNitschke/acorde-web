"use strict";
const Http_1 = require("./../messages/Http");
class ParsedRoute {
    constructor(intRoute) {
        let path = intRoute.path.trim();
        path = path.startsWith("/") ? path.substring(1) : path;
        this.parts = path.split("/");
        this.partCount = this.parts.length;
        this.staticParts = this.parts.filter(p => p !== "**");
        this.staticPartCount = this.staticParts.length;
        this.addr = intRoute.addr;
    }
    matches(url) {
        let path = url.trim();
        path = path.startsWith("/") ? path.substring(1) : path;
        path = path.endsWith("/") ? path.substring(0, path.length - 1) : path;
        const urlParts = path.split("/");
        const urlPartCount = urlParts.length;
        const routePartCount = this.partCount;
        const options = {};
        const matchesPart = (urlPart, templatePart) => {
            if (templatePart.startsWith("$")) {
                if (urlPart) {
                    options[templatePart.substring(1)] = urlPart;
                    return true;
                }
                else {
                    return false;
                }
            }
            if (templatePart == urlPart)
                return true;
            if (templatePart === "*" || templatePart === "**")
                return true;
            if (!templatePart && !urlPart)
                return true;
            if (templatePart.trim() == urlPart.trim())
                return true;
            if (!templatePart || !urlPart)
                return false;
            if (!templatePart.trim() && !urlPart.trim())
                return true;
            if (!templatePart.trim() || !urlPart.trim())
                return false;
            return false;
        };
        if (urlPartCount === routePartCount) {
            const matches = urlParts.reduce((prv, current, index) => prv && matchesPart(current, this.parts[index]), true);
            return { matches, options };
        }
        else {
            if (urlPartCount > routePartCount) {
                if (this.parts[routePartCount - 1] === "**") {
                    while (urlParts.length > routePartCount)
                        urlParts.pop();
                    const matches = urlParts.reduce((prv, current, index) => prv && matchesPart(current, this.parts[index]), true);
                    return { matches, options };
                }
                else {
                    return { matches: false, options: {} };
                }
            }
            else {
                if (urlPartCount >= this.staticPartCount) {
                    while (urlParts.length > this.staticPartCount)
                        urlParts.pop();
                    const matches = urlParts.reduce((prv, current, index) => prv && matchesPart(current, this.parts[index]), true);
                    return { matches, options };
                }
                else {
                    return { matches: false, options: {} };
                }
            }
        }
    }
}
class RoutingActor {
    constructor() {
        this.routes = [];
        this.parsedRoutes = [];
    }
    async start(props) {
        //if(!props.routes) throw new Error("no routes provided to worker");
        //if(!Array.isArray(props.routes)) throw new Error("invalid route format provided to worker");
        this.routes = props.routes;
        this.parsedRoutes = this.routes.map(r => new ParsedRoute(r));
        return;
    }
    async handle(msg, sendMessage) {
        let reqStatus = msg.req;
        let resStatus = msg.res;
        let status = msg.status;
        const [url, queryString] = msg.req.path.split("?");
        reqStatus.query = {};
        if (queryString) {
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
            if (match.matches) {
                var enhancedRequest = { ...reqStatus };
                enhancedRequest.params = match.options;
                const routeResult = await sendMessage(route.addr, { req: enhancedRequest, res: resStatus, status }, true);
                if (routeResult.error) {
                    throw new Error(routeResult.error);
                }
                if (routeResult.returnValue) {
                    status = Http_1.HttpMessageStatus.FINISHED;
                    routeResult.content.status = status;
                    return routeResult.content;
                }
                else {
                    if (!routeResult.content) {
                        return routeResult;
                    }
                    status = Http_1.HttpMessageStatus.PROCESSING;
                    reqStatus = routeResult.content.req;
                    resStatus = routeResult.content.res;
                }
            }
        }
        msg.res.body = "404 - Path: " + url + " was not found on this server! \n Routes: " + this.routes.map(r => r.path).join(", ");
        return;
    }
}
module.exports = new RoutingActor();
