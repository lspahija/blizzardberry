# Vision

**Empower anybody to super-easily add a natural language interface to their app. Support voice. 
The end-user of the app should be able to perform actions on the app just by communicating their intentions via the interface.
The interface should be powered by easily pluggable AI models so that new models can be supported as soon as they're released.**

## Run the project locally

Install pnpm if you haven't already:

```bash
npm install -g pnpm
```

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Architecture

- admin portal where app/website owner pastes in their OpenAPI spec. the spec is parsed with each endpoint becoming an action. 
(also support dropping in curl commands)

- when an end-user uses the app's chatbot and wants to perform an action, the LLM retrieves the tool corresponding to that action

- the chatbot frontend widget populates a fetch request with the tool's url, http method, headers, and body and executes the request

- another llm instance without tools is then called to parse the response and return a user-friendly message
  (vercel's ai sdk supports multiple steps in a single llm invocation, so maybe possible in a single call to the same instance)

## Example

See an example SaaS app with integrated chatbot at http://localhost:3000/example-saas

## Next steps
- Clean up chatbot experience. It needs to communicate that the action was successfully done. Allow debug mode where it also prints (or just console.logs) the response from the action endpoint
- landing page needs to sell the product
- implement RAG - automatically pull docs from website during onboarding? - https://claude.ai/chat/23435dbc-4393-4648-9285-5a39e4bee785
- multi-tenancy - [next.js auth with supabase adapter](https://authjs.dev/getting-started/adapters/supabase) with OAuth and row-level tenancy. keep it simple
- tools should be able to take parameters
- Stripe to sell the product $$
- add google analytics
- deploy to vercel
- rename and get domain!

## Down the road
- how to allow purely frontend actions? Window-Level API Object (not quite global scope but close)
- maybe use some software or lib to autodiscover website endpoints/capabilities to make onboarding super simple
- Create admin UI form allowing user to manually create actions like chatbase allows

## Competition
- https://www.chatbase.co/
  - [custom actions](https://www.chatbase.co/docs/user-guides/chatbot/actions/custom-action)