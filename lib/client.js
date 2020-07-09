"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const graphql_1 = require("graphql");
const serialize_error_1 = require("serialize-error");
class IpcLink extends client_1.ApolloLink {
    constructor(options) {
        super();
        this.counter = 0;
        this.channel = 'graphql';
        this.observers = new Map();
        this.listener = (event, id, type, data) => {
            if (!this.observers.has(id)) {
                console.error(`Missing observer for query id ${id}.`);
            }
            const observer = this.observers.get(id);
            switch (type) {
                case 'data':
                    return observer && observer.next(data);
                case 'error': {
                    this.observers.delete(id);
                    return observer && observer.error(serialize_error_1.deserializeError(data));
                }
                case 'complete': {
                    this.observers.delete(id);
                    return observer && observer.complete();
                }
            }
        };
        this.ipc = options.ipc;
        if (typeof options.channel !== 'undefined') {
            this.channel = options.channel;
        }
        this.ipc.on(this.channel, this.listener);
    }
    request(operation) {
        return new client_1.Observable((observer) => {
            const current = `${++this.counter}`;
            const request = {
                operationName: operation.operationName,
                variables: operation.variables,
                query: graphql_1.print(operation.query),
                context: operation.getContext(),
            };
            this.observers.set(current, observer);
            this.ipc.send(this.channel, current, request);
        });
    }
    dispose() {
        this.ipc.removeListener(this.channel, this.listener);
    }
}
exports.IpcLink = IpcLink;
exports.createIpcLink = (options) => {
    return new IpcLink(options);
};
