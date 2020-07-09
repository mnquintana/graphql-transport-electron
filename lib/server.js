"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const iterall_1 = require("iterall");
const utilities_1 = require("@apollo/client/utilities");
const client_1 = require("@apollo/client");
const graphql_1 = require("graphql");
const serialize_error_1 = require("serialize-error");
const isSubscription = query => {
    const main = utilities_1.getMainDefinition(query);
    return main.kind === 'OperationDefinition' && main.operation === 'subscription';
};
const ensureIterable = data => {
    if (iterall_1.isAsyncIterable(data)) {
        return data;
    }
    return iterall_1.createAsyncIterator([data]);
};
exports.createSchemaLink = (options) => {
    const handleRequest = (request, observer) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const context = options.context && (yield options.context(request));
            const args = {
                schema: options.schema,
                rootValue: options.root,
                contextValue: context,
                variableValues: request.variables,
                operationName: request.operationName,
                document: request.query,
            };
            const result = isSubscription(request.query) ? graphql_1.subscribe(args) : graphql_1.execute(args);
            const iterable = ensureIterable(yield result);
            yield iterall_1.forAwaitEach(iterable, (value) => observer.next(value));
            observer.complete();
        }
        catch (error) {
            observer.error(error);
        }
    });
    const createObservable = (request) => {
        return new client_1.Observable(observer => {
            handleRequest(request, observer);
        });
    };
    return new client_1.ApolloLink(request => createObservable(request));
};
exports.createIpcExecutor = (options) => {
    const channel = options.channel || 'graphql';
    const listener = (event, id, request) => {
        const result = client_1.execute(options.link, Object.assign(Object.assign({}, request), { query: graphql_1.parse(request.query) }));
        return result.subscribe(data => event.sender.send(channel, id, 'data', data), error => event.sender.send(channel, id, 'error', serialize_error_1.serializeError(error)), () => event.sender.send(channel, id, 'complete'));
    };
    options.ipc.on(channel, listener);
    return () => {
        options.ipc.removeListener(channel, listener);
    };
};
var client_2 = require("./client");
exports.IpcLink = client_2.IpcLink;
exports.createIpcLink = client_2.createIpcLink;
