import { toCamelCase } from './actionUtils';

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

const indentContent = (code: string, spaces = 2) => {
  if (!code) return '';
  const indent = ' '.repeat(spaces);
  return code
    .trim()
    .split('\n')
    .map((line) => (line.length ? indent + line : line))
    .join('\n');
};

export const getScriptTag = (framework: Framework, config: ScriptConfig) => {
  const { id, content } = config;

  switch (framework) {
    case Framework.NEXT_JS:
      return `<Script id="${id}" strategy="afterInteractive">
${
  content
    ? `  {\`
${indentContent(content, 4)}
  \`}`
    : ''
}
</Script>`;
    case Framework.REACT:
    case Framework.VUE:
    case Framework.ANGULAR:
    case Framework.VANILLA:
    default:
      return `<script id="${id}" type="text/javascript">
${indentContent(content || '', 2)}
</script>`;
  }
};


const getActionsAssignment = (
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
      const functionNameCamelCase = toCamelCase(functionName);
      const params = dataInputs
        .filter((i) => i.name)
        .map((i) => i.name)
        .join(', ');

      if (framework === Framework.NEXT_JS) {
        return `    ${functionNameCamelCase}: async (user, args) => {
      // Your custom action logic goes here
      // Access arguments from args object: args.${params.split(', ')[0] || 'exampleArg'}
      return { status: 'success', results: [] };
  }`;
      } else {
        return `    ${functionNameCamelCase}: async (user, args) => {
      // Your custom action logic goes here
      // Access arguments from args object: args.${params.split(', ')[0] || 'exampleArg'}
      return { status: 'success', results: [] };
    }`;
      }
    })
    .join(',\n');

  if (framework === Framework.NEXT_JS) {
    return `window.agentActions = {\n${functionsCode}\n};`;
  } else {
    return `window.agentActions = {\n${functionsCode}\n};`;
  }
};

// Unified embed snippet: registers user config, actions, and loads the agent in ONE tag
export const getUnifiedEmbedScript = (
  framework: Framework,
  agentId: string,
  userConfig: Record<string, any>,
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
  const configLine = `window.agentUserConfig = ${JSON.stringify(
    userConfig,
    null,
    2
  )};`;

  const actionsLine =
    actions && actions.length > 0
      ? getActionsAssignment(framework, actions)
      : '';

  const loader =
    framework === Framework.NEXT_JS
      ? `(function(){
  var s = document.createElement('script');
  s.id = 'blizzardberry-agent';
  s.src = '${process.env.NEXT_PUBLIC_URL}/agent/agent.js';
  s.async = true;
  s.setAttribute('data-agent-id', '${agentId}');
  document.body.appendChild(s);
})();`
      : `(function(){
  var s = document.createElement('script');
  s.id = 'blizzardberry-agent';
  s.src = '${process.env.NEXT_PUBLIC_URL}/agent/agent.js';
  s.async = true;
  s.setAttribute('data-agent-id', '${agentId}');
  document.body.appendChild(s);
})();`;

  const content = [configLine, actionsLine, loader]
    .filter(Boolean)
    .join('\n');

  return getScriptTag(framework, {
    id: 'blizzardberry-embed',
    content,
  });
};
