import {
  BaseAction,
  ExecutionContext,
  Parameter,
} from '@/app/api/lib/model/action/baseAction';

export interface FrontendAction extends BaseAction {
  executionContext: ExecutionContext.CLIENT;
  executionModel: FrontendModel;
}

export interface FrontendModel {
  functionName: string;
  parameters: Parameter[];
}
