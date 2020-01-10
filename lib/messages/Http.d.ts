export declare enum HttpMethod {
    GET = 0,
    POST = 1,
    PUT = 2,
    HEAD = 3,
    DELETE = 4,
    PATCH = 5,
    OPTIONS = 6,
    OTHER = 7
}
export declare function parseHttpMethod(methodName?: string): HttpMethod;
export declare enum HttpMessageStatus {
    PROCESSING = 0,
    FINISHED = 1
}
export declare type HttpRequest = {
    path: string;
    params: any;
    query: {
        [param: string]: string;
    };
    method: HttpMethod;
    headers: {
        [header: string]: string;
    };
    body: any;
};
export declare type HttpResponse = {
    headers: {
        [header: string]: string;
    };
    status: number;
    body: any;
};
export declare type HttpMesssage = {
    req: HttpRequest;
    res: HttpResponse;
    status: HttpMessageStatus;
};
