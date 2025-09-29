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

  // Tag 1: external agent loader (with each attribute on its own line)
  const loaderTag =
    framework === Framework.NEXT_JS
      ? `<Script
  id="blizzardberry-agent"
  src="${process.env.NEXT_PUBLIC_URL}/agent/agent.js"
  strategy="afterInteractive"
  data-agent-id="${agentId}"
/>`
      : `<script
  id="blizzardberry-agent"
  src="${process.env.NEXT_PUBLIC_URL}/agent/agent.js"
  type="text/javascript"
  data-agent-id="${agentId}"
></script>`;

  // Tag 2: inline config + actions (pretty formatted via getScriptTag)
  const inlineContent = [configLine, actionsLine]
    .filter(Boolean)
    .join('\n');
  const configActionsTag = getScriptTag(framework, {
    id: 'blizzardberry-config-actions',
    content: inlineContent,
  });

  // Return loader first, then config/actions
  return `${loaderTag}\n\n${configActionsTag}`;
};
