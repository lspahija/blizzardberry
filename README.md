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

## Architecture and notes

- admin portal where app/website owner enters an action curl and the curl is parsed into json and the json is saved as a tool
(this should also support dropping in an openapi spec and automatically generating all the tools from that)

- when an end-user uses the app's chatbot, and wants to perform an action, the LLM retrieves the tool corresponding to that action

- the chatbot frontend widget populates a fetch request with the tool's url, http method, headers, and body and executes the request

- another llm instance without tools is then called to parse the response and return a user-friendly message
  (vercel's ai sdk supports multiple steps in a single llm invocation, so maybe possible in a single call to the same instance)