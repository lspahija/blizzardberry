# Vision

**Empower anybody to super-easily add a natural language interface to their app. Support voice. 
The end-user of the app should be able to perform actions on the app just by communicating their intentions via the interface.
The interface should be powered by easily pluggable AI models so that new models can be supported as soon as they're released.**

There is a lot of useful software out there, but the vast majority does not have a natural language interface. 
The goal of this project is to enable all software to have a natural language interface. 
Make onboarding so easy that it becomes a no-brainer for app owners to add a natural language interface to their app.

Code quality and architecture of this project are imperative! 
They are considered a competitive advantage and must allow for rapid iteration and extensibility. 

e.g. it must be easy to:
- add new AI models (as AI models improve, the usefulness of this product should automatically improve in parallel)
- create new SDKs for different languages so a chatbot can be added to any app
- enable new ways for app owners to onboard their website (parse OpenAPI spec, parse cURL, autodiscovery, etc.)

## Run the project locally

This project uses [git-crypt](https://github.com/AGWA/git-crypt) to encrypt sensitive files. (like .env*)

After you clone the repo, you need to execute the following:

```bash
gpg --armor --export <your-email> > your-name-public-key.asc
```

Then send the public key and your email to someone that already has access to the repo, and they will import your public key with the following commands:

```bash
gpg --import their-public-key.asc
```

```bash
git-crypt add-gpg-user <their-email>
```

Now install git-crypt: (macOS instructions, for other platforms google it)
```bash
brew install git-crypt
```

Then unlock the repo:

```bash
git-crypt unlock
```

Now you can freely pull and push to the repo without worrying about the sensitive files (.env*). If you create other sensitive files, make sure to add them to `.gitattributes` so that they are encrypted.

Install pnpm:

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

Access the landing page at [http://localhost:3000](http://localhost:3000) 

## Use Chatbot

See an example SaaS app with integrated chatbot at http://localhost:3000/example-saas

## Connect to Supabase Database with Your Favorite Postgres Client

- URL: `jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres`
- user: `postgres.pwlbhcjwuwsvszkvqexy`
- password: [your Supabase password]

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Things to do

## Immediate TODO

## Next steps
- allow chatbot to perform frontend actions [like chatbase allows](https://www.chatbase.co/docs/developer-guides/client-side-custom-actions) (chatbot can call a function that performs an action on the frontend)
- multi-tenancy - [next.js auth with supabase adapter](https://authjs.dev/getting-started/adapters/supabase) with OAuth and row-level tenancy. keep it simple
- Stripe to sell the product $$ - I set up Stripe for Brothers of Ostia in November 2024 and it was a pain. [Here's the repo](https://github.com/lucidity-labs/ostians). Maybe the Stripe docs have improved in the meantime though.
- [finish onboarding](#posthog) PostHog for analytics
- landing page needs to sell the product well!
- rename and get domain!
- deploy to vercel

## Later on
- minify and obfuscate widget js
- stream LLM responses to the frontend. (maybe by getting vanilla js version of useChat working?)
- let user just pass in their OpenAPI spec and the app will automatically generate a chatbot for them
- maybe use some software or lib to autodiscover website endpoints/capabilities to make onboarding super simple
- automatically pull docs from website during onboarding for RAG?
- [optimize RAG pipeline](#frankies-tips-to-optimize-rag)
- create SDKs for non-js frontends i.e. desktop and mobile apps (analogues to widget.js)
- use AI to make onboarding super simple - PostHog has an "AI setup wizard" that you can install like this: `npx @posthog/wizard@latest --region us`. This gives it access to your code.
- allow user to use voice, the ideal is that they just talk to computer


## Competition
- https://www.chatbase.co/
  - [custom actions](https://www.chatbase.co/docs/user-guides/chatbot/actions/custom-action)

## Design
The design is based on this: https://gitingest.com/


## Notes

### PostHog

Successfully installed PostHog!

Changes made:
- Installed posthog-js & posthog-node packages
- Initialized PostHog and added pageview tracking
- Created a PostHogClient to use PostHog server-side
- Setup a reverse proxy to avoid ad blockers blocking analytics requests
- Added your Project API key to your .env.local file

Next steps:
- Call posthog.identify() when a user signs into your app
- Call posthog.capture() to capture custom events in your app
- Upload your Project API key to your hosting provider
- Create a PR for your changes

Learn more about PostHog + Next.js: https://posthog.com/docs/libraries/next-js

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



