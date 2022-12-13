declare class BidirectionalStream {
    writable: WritableStream<Uint8Array>;
    readable: ReadableStream<Uint8Array>;
    constructor(ws: WebSocket);
}

declare class DataGrams {
    writable: WritableStream<Uint8Array>;
    readable: ReadableStream<Uint8Array>;
    constructor(ws: WebSocket);
}

declare class ReceiveStream {
    constructor(ws: WebSocket);
}

declare class SendStream {
    constructor(ws: WebSocket);
}

declare global {
    interface Window {
        WebTransport: any;
    }
}
declare class WebTransport {
    #private;
    url: string;
    closed: Promise<unknown>;
    ready: Promise<unknown>;
    datagrams: DataGrams;
    constructor(url: string);
    createSendStream(): SendStream;
    receiveStream(): ReceiveStream;
    createBidirectionalStream(): Promise<BidirectionalStream>;
    receiveBidrectionalStreams(): BidirectionalStream;
}

export { WebTransport, WebTransport as default };
