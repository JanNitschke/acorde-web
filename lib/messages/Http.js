"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
    HttpMethod[HttpMethod["HEAD"] = 3] = "HEAD";
    HttpMethod[HttpMethod["DELETE"] = 4] = "DELETE";
    HttpMethod[HttpMethod["PATCH"] = 5] = "PATCH";
    HttpMethod[HttpMethod["OPTIONS"] = 6] = "OPTIONS";
    HttpMethod[HttpMethod["OTHER"] = 7] = "OTHER";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
function parseHttpMethod(methodName) {
    if (!methodName)
        return HttpMethod.OTHER;
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
exports.parseHttpMethod = parseHttpMethod;
var HttpMessageStatus;
(function (HttpMessageStatus) {
    HttpMessageStatus[HttpMessageStatus["PROCESSING"] = 0] = "PROCESSING";
    HttpMessageStatus[HttpMessageStatus["FINISHED"] = 1] = "FINISHED";
})(HttpMessageStatus = exports.HttpMessageStatus || (exports.HttpMessageStatus = {}));
