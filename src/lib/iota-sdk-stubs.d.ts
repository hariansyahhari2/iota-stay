
declare module '@iota/iota-sdk/client' {
    export function getFullnodeUrl(network: string): string;
    export type IotaObjectData = any;
    export type IOutputResponse = any;
}

declare module '@iota/iota-sdk/transactions' {
    export class Transaction {
        moveCall(args: any): void;
    }
}
