
export enum HttpMethod {
    GET,
    POST,
    PUT,
    HEAD,
    DELETE,
    PATCH,
    OPTIONS,
    OTHER
}

export function parseHttpMethod(methodName?: string): HttpMethod {
    if(!methodName) return HttpMethod.OTHER;
    switch (methodName.trim().toUpperCase()) {
        case "GET":
            return HttpMethod.GET;
        case "POST":
            return HttpMethod.POST;
        case "PUT":
            return HttpMethod.PUT;
        case "HEAD":
            return HttpMethod.HEAD;
        case "DELETE":
            return HttpMethod.DELETE;
        case "PATCH":
            return HttpMethod.PATCH;
        case "OPTIONS":
            return HttpMethod.OPTIONS;
        default:
            return HttpMethod.OTHER;
    }
}
export enum HttpMessageStatus {
    PROCESSING,
    FINISHED
}

export type HttpRequest = {
    path: string;
    params: any;
    query: { [param: string]: string };
    method: HttpMethod;
    headers: { [header: string]: string };
    body: any;
}

export type HttpResponse = {
    headers: { [header: string]: string };
    status: number;
    body: any;
}

export type HttpMesssage = {
    req: HttpRequest;
    res: HttpResponse;
    status: HttpMessageStatus;
}

