export enum ExecutionContext {
    CLIENT = "CLIENT",
    SERVER = "SERVER",
}

export enum ParameterType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
}

export interface Parameter {
    name: string;
    description: string;
    type: ParameterType;
    isArray: boolean;
}

export interface RequestHeaders {
    [key: string]: string;
}

export interface RequestBody {
    [key: string]: string | number | boolean | (string | number | boolean)[];
}

export interface RequestModel {
    url: string;
    method: string;
    headers?: RequestHeaders;
    body?: RequestBody;
}

export interface HttpModel {
    request: RequestModel;
    parameters: Parameter[];
}

export interface FrontendModel {
    functionName: string;
    parameters: Parameter[];
}

export interface BaseAction {
    name: string;
    description: string;
    executionContext: ExecutionContext;
}

export interface BackendAction extends BaseAction {
    executionContext: ExecutionContext.SERVER;
    httpModel: HttpModel;
}

export interface FrontendAction extends BaseAction {
    executionContext: ExecutionContext.CLIENT;
    frontendModel: FrontendModel;
}

export type Action = BackendAction | FrontendAction;