import { Framework, getActionsScript } from './scriptUtils';

interface DataInput {
  name: string;
  type: string;
  description: string;
  isArray: boolean;
  required: boolean;
}

export const getInputNames = (dataInputs: DataInput[], withBraces = false) => {
  const names = dataInputs
    .map((input) => input.name)
    .filter((name) => name !== '');
  return withBraces ? names.map((name) => `{{${name}}}`) : names;
};

export const getRegisterToolsExample = (
  functionName: string,
  dataInputs: DataInput[],
  framework: Framework = Framework.VANILLA
) => {
  return getActionsScript(framework, [
    {
      functionName,
      dataInputs,
    },
  ]);
};

export const getRegisterMultipleToolsExample = (
  actions: { functionName: string; dataInputs: DataInput[] }[],
  framework: Framework = Framework.VANILLA
) => {
  return getActionsScript(framework, actions);
};
