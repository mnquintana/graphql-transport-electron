import { SchemaLinkOptions, IpcExecutorOptions } from './types';
import { ApolloLink } from '@apollo/client';
export declare const createSchemaLink: <TRoot = any>(options: SchemaLinkOptions) => ApolloLink;
export declare const createIpcExecutor: (options: IpcExecutorOptions) => () => void;
export { IpcLink, createIpcLink } from './client';
