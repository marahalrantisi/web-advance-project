declare module 'dotenv' {
  export function config(): void;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string): any;
  export function decode(token: string): any;
}

declare module 'ws' {
  import { Server as HttpServer } from 'http';
  
  export class WebSocketServer {
    constructor(options: { server: HttpServer });
    on(event: string, callback: (ws: WebSocket, req: any) => void): void;
    clients: Set<WebSocket>;
  }
  
  export class WebSocket {
    on(event: string, callback: (data: any) => void): void;
    send(data: string): void;
    readyState: number;
    OPEN: number;
  }
} 