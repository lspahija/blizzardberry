import { Framework, getActionsScript } from './scriptUtils';

interface DataInput {
  name: string;
  type: string;
  description: string;
  isArray: boolean;
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

export function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(?:^|\s)([a-zA-Z])/g, (match, p1, offset) =>
      offset === 0 ? p1.toLowerCase() : p1.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/^[^a-zA-Z]/, '')
    .replace(/^$/, 'customAction');
}
