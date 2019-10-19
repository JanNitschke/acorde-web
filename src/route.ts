import { Addr } from 'acorde';


export type Route = {
    path: string;
    filepath: string;
    options: any;
    parallel: boolean;
}

export type IntRoute = {
    path: string;
    addr: Addr;
}