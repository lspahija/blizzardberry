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


# Running the Project Locally

This guide outlines the steps to set up and run the project locally. The project uses [git-crypt](https://github.com/AGWA/git-crypt) to encrypt sensitive files (e.g., `.env*`).

## Setup Instructions

### 1. Clone the Repository
Clone the project repository to your local machine.

### 2. Configure git-crypt
To access encrypted files, follow these steps:

1. **Export Your Public Key**  
   Run the following command, replacing `<your-email>` with your email address:
   ```bash
   gpg --armor --export <your-email> > your-name-public-key.asc
   ```

2. **Share Your Public Key**  
   Send the generated `your-name-public-key.asc` file and your email to a team member with repository access.

3. **Import Their Public Key**  
   The team member will import your public key into their GPG keyring:
   ```bash
   gpg --import their-public-key.asc
   ```

4. **Add Your GPG User**  
   The team member will add you to git-crypt with:
   ```bash
   git-crypt add-gpg-user <their-email>
   ```

### 3. Install git-crypt
For macOS, install git-crypt using Homebrew:
```bash
brew install git-crypt
```
For other platforms, refer to the [git-crypt documentation](https://github.com/AGWA/git-crypt).

### 4. Unlock the Repository
Unlock the encrypted files:
```bash
git-crypt unlock
```
Now you can pull and push to the repository without issues. If you add new sensitive files, ensure they are listed in `.gitattributes` for encryption.

### 5. Set Up LM Studio
1. Install [LM Studio](https://lmstudio.ai/).
2. Download the `qwen3-8b` model in LM Studio.
3. Enable **Developer Mode** in LM Studio.
4. Start the LM Studio server to serve the model at `http://localhost:1234/v1`.

### 6. Install pnpm
Install pnpm globally:
```bash
npm install -g pnpm
```

### 7. Install Dependencies
Navigate to the project directory and install dependencies:
```bash
pnpm install
```

### 8. Run the Development Server
Start the development server:
```bash
pnpm dev
```

### 9. Access the Application
Open your browser and visit:
[http://localhost:3000](http://localhost:3000) to see the landing page.


# Use Chatbot

See an example SaaS app with integrated chatbot at http://localhost:3000/example-saas

# Connect to Supabase Database with Your Favorite Postgres Client

- URL: `jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres`
- user: `postgres.pwlbhcjwuwsvszkvqexy`
- password: `[your Supabase password]`

# Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Things to be done

## Before Launch
- add a frontend to the RAG pipeline so the app owner can upload documentation
- test RAG pipeline with big documents and ensure everything works
- multi-tenancy - [next.js auth with supabase adapter](https://authjs.dev/getting-started/adapters/supabase) with OAuth and row-level tenancy. keep it simple
  - Google OAuth
    - [publish app](https://console.cloud.google.com/auth/clients?inv=1&invt=Abx7rg&project=ufcalarm-b270d)
    - [create new client](https://console.cloud.google.com/auth/clients?inv=1&invt=Abx7tQ&project=ufcalarm-b270d)
  - GitHub OAuth
    - [create prod OAuth app](https://github.com/settings/developers)
- polish the user onboarding experience. All the forms needs to work flawlessly and be easy to use.
- currently we give the user `<Script>` tags to put in their app. These are from `'next/script'`. The user isn't necessarily using next.js, so we should give them appropriate script tags for the framework they're using.
- Stripe to sell the product $$ - I set up Stripe for Brothers of Ostia in November 2024 and it was a pain. [Here's the repo](https://github.com/lucidity-labs/ostians). Maybe the Stripe docs have improved in the meantime though.
- [finish onboarding](#posthog) PostHog for analytics
- landing page needs to sell the product well!
- rename and get domain!
- deploy to vercel

## Launch and Sell! 
#### [What YC says about selling](https://youtu.be/hyYCn_kAngI?si=1Adt1_ASb7dK8N_v)

## After Launch (while also selling) 
#### Note: do not work on these feature unless you're also selling. If you're not selling, stop working on these and start selling.
- add "Powered By omni-interface" to the bottom of the chatbot
- make chatbot design super customizable so app owners can make it look like their app
- add automated end-to-end test suite so we can introduce new features without breaking existing functionality. Use Playwright for this. [Grok thread](https://grok.com/share/bGVnYWN5_82a58179-e019-4507-a75b-59c398539835)
- minify and obfuscate chatbot.js code
- stream LLM responses to the frontend. (maybe by getting vanilla js version of useChat working?) (ai-sdk currently only support react, vue, svelte and solid)
- automatically pull docs from website during RAG onboarding?
- [optimize RAG pipeline](#frankies-tips-to-optimize-rag)
- create SDKs (analogues to chatbot.js) for non-js frontends i.e. desktop and mobile apps written in go, java, etc.
- allow user to use voice, the ideal is that they just talk to computer
- make the actions MCP-compatible? i.e. turn the actions into an MCP server so that any MCP client can call them.
- make onboarding a new app as simple as possible
  - maybe let user just pass in their OpenAPI spec and the app will automatically generate a chatbot for them
  - maybe use AI to scan the app's codebase - PostHog has an "AI setup wizard" that you can install like this: `npx @posthog/wizard@latest --region us`. This gives it access to your code.
  - Google has a [Chrome extension](https://chromewebstore.google.com/detail/project-mariner-companion/kadmollpgjhjcclemeliidekkajnjaih) where you can teach the AI how to perform tasks. Maybe you can create an extension that records HTTP requests and functions called on each click and turns them into actions.
  - maybe use some tool to autodiscover website endpoints/capabilities
  - brainstorm what the ideal frictionless onboarding would look like. Ideally the webapp owner doesn't have to do anything. We offer them a chatbot that just works.


# Competition
- https://www.chatbase.co/
  - [custom actions](https://www.chatbase.co/docs/user-guides/chatbot/actions/custom-action)

# Design
The website design is based on this: https://gitingest.com/


# Notes

### SDK that allows app owners to add metadata

chatbase offers an sdk that can be embedded in frontend and provide user metadata
and then the chatbot can access that to populate fields in request

You can add metadata in two ways:

Using the embed code:
```javascript
window.chatbaseUserConfig = {
user_id: "123",
user_hash: "hash",
user_metadata: {
"name": "John Doe",
"email": "john@example.com",
"company": "Acme Inc"
}
}
```

Using the SDK identify method:
```javascript
window.chatbase("identify", {
user_id: "123",
user_hash: "hash",
user_metadata: {
"name": "John Doe",
"email": "john@example.com",
"company": "Acme Inc"
}
});
```

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


### Ideas
- tool fetching can maybe be made more accurate by inserting a RAG step (e.g. embed the tool information). how does the lib currently fetch under the hood? maybe it already does this?

### Development Notes
- update `pnpm` with `pnpm self-update`
- update all packages to latest versions with `pnpm update --latest`
- update all packages while respecting defined version ranges with `pnpm update`
