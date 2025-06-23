export enum Framework {
  NEXT_JS = 'next.js',
  REACT = 'react',
  VUE = 'vue',
  ANGULAR = 'angular',
  VANILLA = 'vanilla',
}

interface ScriptConfig {
  id: string;
  content?: string;
}

export const getScriptTag = (framework: Framework, config: ScriptConfig) => {
  const { id, content } = config;

  switch (framework) {
    case Framework.NEXT_JS:
      return `<Script id="${id}" strategy="afterInteractive">
${content ? `  ${content}` : ''}
</Script>`;
    case Framework.REACT:
    case Framework.VUE:
    case Framework.ANGULAR:
    case Framework.VANILLA:
    default:
      return `<script id="${id}" type="text/javascript">
${content ? `  ${content}` : ''}
</script>`;
  }
};

export const getAgentConfigScript = (
  framework: Framework,
  config: Record<string, any>
) => {
  const content = `window.agentUserConfig = ${JSON.stringify(config, null, 2)};`;
  return getScriptTag(framework, {
    id: 'blizzardberry-config',
    content,
  });
};

const agentScriptNextJs = (agentId: string) => `
  id="blizzardberry-agent"
  src="${process.env.NEXT_PUBLIC_URL}/agent/agent.js" 
  strategy="afterInteractive"
  data-agent-id="${agentId}"
`;

const agentScriptVanilla = (agentId: string) => `
  id="blizzardberry-agent"
  src="${process.env.NEXT_PUBLIC_URL}/agent/agent.js"
  type="text/javascript"
  data-agent-id="${agentId}"
`;

export const getAgentScript = (framework: Framework, agentId: string) => {
  if (framework === Framework.NEXT_JS) {
    return `<Script ${agentScriptNextJs(agentId)}/>`;
  } else {
    return `<script ${agentScriptVanilla(agentId)}/>`;
  }
};

export const getActionsScript = (
  framework: Framework,
  actions: Array<{
    functionName: string;
    dataInputs: Array<{
      name: string;
      type: string;
      description: string;
      isArray: boolean;
    }>;
  }>
) => {
  const functionsCode = actions
    .map(({ functionName, dataInputs }) => {
      const argList = dataInputs
        .filter((i) => i.name)
        .map((i) => i.name)
        .join(', ');
      const params = [argList, 'userConfig'].filter(Boolean).join(', ');
      return `  ${functionName || 'your_action'}: async (${params}) => {
    try {
      // ${
        argList
          ? argList
              .split(', ')
              .map((n) => `use ${n}`)
              .join(', ')
          : 'no arguments'
      }
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

  const content = `window.agentActions = {\n  ${functionsCode}\n};`;
  return getScriptTag(framework, {
    id: 'blizzardberry-actions',
    content,
  });
};
