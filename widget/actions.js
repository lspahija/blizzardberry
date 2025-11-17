import { generateId } from './util';
import { state } from './state';
import { persistMessage } from './api';
import { config } from './config';

export async function executeAction(actionModel) {
  const actionResult = actionModel.toolName.startsWith('ACTION_CLIENT_')
    ? await executeClientAction(actionModel)
    : await executeServerAction(actionModel);

  const actionName = actionModel.toolName.replace(
    /^ACTION_(CLIENT_|SERVER_)/,
    ''
  );

  state.messages.push({
    id: generateId(),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: `The action ${actionName} was successfully executed.`,
      },
    ],
  });

  await persistMessage(state.messages[state.messages.length - 1]);

  return `ACTION_RESULT: ${JSON.stringify(actionResult)}`;
}

async function executeClientAction(actionModel) {
  const functionName = actionModel.functionName.replace('ACTION_CLIENT_', '');
  const action = config.actions[functionName];
  return await action(config.userConfig, actionModel.args);
}

async function executeServerAction(actionModel) {
  const response = await fetch(actionModel.url, {
    method: actionModel.method,
    headers: actionModel.headers,
    body: JSON.stringify(actionModel.body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
