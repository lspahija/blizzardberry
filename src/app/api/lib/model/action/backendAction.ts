import {
  BaseAction,
  ExecutionContext,
  Parameter,
} from '@/app/api/lib/model/action/baseAction';

export interface BackendAction extends BaseAction {
  executionContext: ExecutionContext.SERVER;
  executionModel: BackendModel;
}

export interface BackendModel {
  request: HttpRequest;
  parameters: Parameter[];
}

export interface HttpRequest {
  url: string;
  method: HttpMethod;
  headers?: Headers;
  body?: Body;
}

export type HttpMethod =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export interface Headers {
  [key: string]: string;
}

export interface Body {
  [key: string]: string | number | boolean | (string | number | boolean)[];
}
