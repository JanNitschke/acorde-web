import { Addr } from 'acorde';
export declare type Route = {
    path: string;
    filepath: string;
    options: any;
    parallel: boolean;
};
export declare type IntRoute = {
    path: string;
    addr: Addr;
};
