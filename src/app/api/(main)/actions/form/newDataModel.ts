enum ParameterType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
}

interface BaseParameter {
    id: string;
    description: string;
    type: ParameterType;
}

interface BodyParameter extends BaseParameter {
    isArray?: boolean;
}

interface RequestParameters {
    path?: BaseParameter[];
    query?: BaseParameter[];
    header?: BaseParameter[];
    body?: BodyParameter[];
}

interface RequestHeaders {
    [key: string]: string;
}

interface RequestBody {
    [key: string]: string | number | boolean | (string | number | boolean)[];
}

interface RequestModel {
    url: string;
    method: string;
    headers?: RequestHeaders;
    body?: RequestBody;
}

interface HttpModel {
    request: RequestModel;
    parameters: RequestParameters;
}