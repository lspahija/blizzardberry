import { callAIModel } from '@/app/api/(main)/lib/llm';

export async function POST(req: Request) {
  const { messages, userConfig } = await req.json();

  return Response.json(await callAIModel(messages, userConfig));
}
