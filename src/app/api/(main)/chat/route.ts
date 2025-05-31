import { callLLM } from '@/app/api/lib/llm/llmInvoker';

export async function POST(req: Request) {
  const { messages, userConfig, chatbotId } = await req.json();

  return Response.json(await callLLM(messages, userConfig, chatbotId));
}
