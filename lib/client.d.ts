/// <reference types="zen-observable" />
import { ApolloLink, Observable, Operation, FetchResult } from '@apollo/client';
import { ApolloIpcLinkOptions } from './types';
export declare class IpcLink extends ApolloLink {
  private ipc;
  private counter;
  private channel;
  private observers;
  constructor(options: ApolloIpcLinkOptions);
  request(
    operation: Operation,
  ): Observable<
    FetchResult<
      {
        [key: string]: any;
      },
      Record<string, any>,
      Record<string, any>
    >
  >;
  protected listener: (event: any, id: any, type: any, data: any) => void;
  dispose(): void;
}
export declare const createIpcLink: (options: ApolloIpcLinkOptions) => IpcLink;
