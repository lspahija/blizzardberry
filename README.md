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

## Immediate TODO
- consolidate frontend and backend models
- get tools with parameters working

## Next steps
- tools should be able to take parameters - https://grok.com/chat/59a1ee92-57df-4aef-b8f5-a26b6b9f34d0 - check how openAPI spec is currently being parsed. I think the chatbot needs to be able to go back and forth with the user to get all the parameters. See how chatbase does this.
- multi-tenancy - [next.js auth with supabase adapter](https://authjs.dev/getting-started/adapters/supabase) with OAuth and row-level tenancy. keep it simple
- admin page where user can add new documents to their chatbot's knowledge base
- Stripe to sell the product $$
- add [google analytics](https://analytics.google.com/) or [posthog](https://posthog.com/)
- landing page needs to sell the product
- deploy to vercel
- rename and get domain!

## Down the road
- minify and obfuscate widget js
- get vanilla js version of useChat working?
- how to allow purely frontend actions? Window-Level API Object (not quite global scope but close)
- maybe use some software or lib to autodiscover website endpoints/capabilities to make onboarding super simple
- Create admin UI form allowing user to manually create actions like chatbase allows
- automatically pull docs from website during onboarding for RAG?
- [optimize RAG pipeline](#frankies-tips-to-optimize-rag)
- clients for non-js frontends i.e. desktop and mobile apps
- allow user to use voice, the ideal is that they just talk to computer


## Competition
- https://www.chatbase.co/
  - [custom actions](https://www.chatbase.co/docs/user-guides/chatbot/actions/custom-action)




## Notes

### Frankie's tips to optimize RAG:

Not sure if you already done that in some other part of code maybe, but if you haven't:
Try to include some metadata about the document when ingesting it. For example, the document’s name, which could just be the filename if no explicit title is available.

If you're dealing with raw text, you might extract the first few words or lines as a fallback title.

It would be ideal, to use an LLM to preprocess the document and extract key metadata into a JSON structure (e.g. title, type, summary, source). This becomes really useful later when you want to filter or rank results during search.

Everything else looks good.

I see that you have a metadata key obviously, just didn’t go through the other files to see what’s in it, I just saw that in your similarity_search there is no filter parameter.
Which could be useful when you have a lot of chunks and a variety of content.

But maybe it isn’t necessary, you could test it out to see if it works well (if you get relevant chunks to the given query) without any filtering.



- tool fetching can maybe be made more accurate by inserting a RAG step. how does the lib fetch under the hood?






chatbase offers an sdk that can be embedded in frontend and provide user metadata
and then the chatbot can access that to populate fields in request

You can add metadata in two ways:

Using the embed code:
window.chatbaseUserConfig = {
user_id: "123",
user_hash: "hash",
user_metadata: {
"name": "John Doe",
"email": "john@example.com",
"company": "Acme Inc"
}
}
Using the SDK identify method:
window.chatbase("identify", {
user_id: "123",
user_hash: "hash",
user_metadata: {
"name": "John Doe",
"email": "john@example.com",
"company": "Acme Inc"
}
});



