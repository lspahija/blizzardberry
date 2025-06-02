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
  dataInputs: DataInput[]
) => {
  const argList =
    dataInputs
      .filter((i) => i.name)
      .map((i) => i.name)
      .join(', ') || '...';
  return `window.ChatbotActions = {
  ${functionName || 'your_action'}: async (args, userConfig) => {
    try {
      // args.${argList}
      // userConfig - exposes the user config if you specified one
      return { 
        status: 'success',
        data: {
          // any object you want to return
        }
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message || 'Failed to execute action' 
      };
    }
  }
};`;
};

export const getRegisterMultipleToolsExample = (
  actions: { functionName: string; dataInputs: DataInput[] }[]
) => {
  const functionsCode = actions
    .map(({ functionName, dataInputs }) => {
      const argList =
        dataInputs
          .filter((i) => i.name)
          .map((i) => i.name)
          .join(', ');
      // If there are no args, just use userConfig
      const params = [argList, 'userConfig'].filter(Boolean).join(', ');
      return `  ${functionName || 'your_action'}: async (${params}) => {
    try {
      // ${argList ? argList.split(', ').map(n => `use ${n}`).join(', ') : 'no arguments'}
      // userConfig - exposes the user config if you specified one
      return { 
        status: 'success',
        data: {
          // any object you want to return
        }
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message || 'Failed to execute action' 
      };
    }
  }`;
    })
    .join(',\n');
  return `<Script id="omni-interface-actions" strategy="afterInteractive">\n  ${`window.ChatbotActions = {\n  ${functionsCode}\n};`}\n</Script>`;
};
