import { BackendAction, BackendModel } from './backendAction';
import {
  FrontendAction,
  FrontendModel,
} from '@/app/api/lib/model/action/frontendAction';

export type Action = BackendAction | FrontendAction;

export interface BaseAction {
  id: string | null;
  name: string;
  description: string;
  executionContext: ExecutionContext;
  chatbotId: string;
}

export enum ExecutionContext {
  CLIENT = 'CLIENT',
  SERVER = 'SERVER',
}

export type ExecutionModel = BackendModel | FrontendModel;

export interface Parameter {
  name: string;
  description: string;
  type: ParameterType;
  isArray: boolean;
}

export enum ParameterType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
}
