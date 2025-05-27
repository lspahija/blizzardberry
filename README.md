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
- onboard new apps with minimal friction

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

### 5. Install pnpm
Install pnpm globally:
```bash
npm install -g pnpm
```

### 6. Install Dependencies
Navigate to the project directory and install dependencies:
```bash
pnpm install
```

### 7. Run the Development Server
Start the development server:
```bash
pnpm dev
```

### 8. Access the Application
Open your browser and visit:
[http://localhost:3000](http://localhost:3000) to see the landing page.

### [See Development Notes](#Development-Notes)

# Use Chatbot

See an example SaaS app with integrated chatbot at http://localhost:3000/example-saas

# Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Things to be done

## Before Launch
- test RAG pipeline with big documents and ensure everything works
- multi-tenancy - [next.js auth with supabase adapter](https://authjs.dev/getting-started/adapters/supabase) with OAuth and row-level tenancy. keep it simple
  - Google OAuth
    - [publish app](https://console.cloud.google.com/auth/clients?inv=1&invt=Abx7rg&project=ufcalarm-b270d)
    - [create new client](https://console.cloud.google.com/auth/clients?inv=1&invt=Abx7tQ&project=ufcalarm-b270d)
  - GitHub OAuth
    - [create prod OAuth app](https://github.com/settings/developers)
  - enable magic links for sign in because this is B2B and employees might not be able to sign in with github account or google account. try resend first. https://authjs.dev/getting-started/authentication/email Postmark seems best but not free tier
- polish the user onboarding experience. All the forms needs to work flawlessly and be easy to use.
- currently we give the user `<Script>` tags to put in their app. These are from `'next/script'`. The user isn't necessarily using next.js, so we should give them appropriate script tags for the framework they're using.
- Stripe to sell the product $$ - I set up Stripe for Brothers of Ostia in November 2024 and it was a pain. [Here's the repo](https://github.com/lucidity-labs/ostians). Maybe the Stripe docs have improved in the meantime though.
- [finish onboarding](#posthog) PostHog for analytics
- landing page needs to sell the product well!
- rename and get domain! - LOTR word like palantir or anduril? - https://grok.com/chat/03fc9ac4-d47b-4012-8b6c-63f2d1affb87
- deploy to vercel
- dogfood the product. Our app needs to have a chatbot integrated, and it needs to work well. Anybody that visits the site gets an instant useful demo!

## Launch and Sell! 
- [What YC says about selling](https://youtu.be/hyYCn_kAngI?si=1Adt1_ASb7dK8N_v) this is a must-watch and implement. Use a CRM and contact a lot of companies. Everyone's conversion rate is low. If you don't contact enough companies, you don't get any sales and you falsely conclude that the product is bad.
- find a CRM that makes selling and tracking our numbers fun! it should be a fun game to see the numbers go up.
- sell companies on the idea that they replace their customer support team. We save them money: https://youtu.be/K4s6Cgicw_A?si=MT1kzLH3p4m7CVyS&t=809
- use latest AI video models (Google's Veo 3) to create great marketing videos. Use good taste to make excellent stuff. 
- [post on HN](https://x.com/marc_louvion/status/1924846419967672829?s=46)
- [affiliate program](https://x.com/marc_louvion/status/1922271980260331772?s=46)
- work with [Pieter Levels](https://x.com/levelsio) or other big guys on X and have them push this as their own

## After Launch (while also selling) 
#### Note: do not work on these feature unless you're also selling. If you're not selling, stop working on these and start selling.
- add "Powered By omni-interface" to the bottom of the chatbot
- minify and obfuscate chatbot.js code
- let the end user see all actions that the chatbot can perform. Make the actions searchable. Expose the thinking tokens if the user chooses to see them.
- make chatbot design super customizable so app owners can make it look like their app
- add automated end-to-end test suite so we can introduce new features without breaking existing functionality. Use Playwright for this. [Grok thread](https://grok.com/share/bGVnYWN5_82a58179-e019-4507-a75b-59c398539835)
- [optimize RAG pipeline](#frankies-tips-to-optimize-rag)
- stream LLM responses to the frontend. (maybe by getting vanilla js version of useChat working?) (ai-sdk currently only support react, vue, svelte and solid)
- create SDKs (analogues to chatbot.js) for non-js frontends i.e. desktop and mobile apps written in go, java, etc.
- add logging, tracing, monitoring so if anything goes wrong anywhere, we can see it
- look through Chatbase's features and add relevant ones. e.g. they have a UI letting their users test the chatbots they created and see if the actions they onboarded work correctly. https://www.chatbase.co/docs/user-guides/chatbot/playground

## Longer Term Goals (buy maybe pull them in earlier)
- make the system prompt auto-improve for each app or even each end user. As the user tells the chatbot what they want, the system prompt is updated to include that information. This way, the chatbot can learn and adapt to the user's needs over time. https://youtu.be/WJoZK9sMwvw?si=CTOwYwskX38WDzOO
- allow user to use voice, the ideal is that they just talk to computer
- make the actions MCP-compatible? i.e. turn the actions into an MCP server so that any MCP client can call them.
- make onboarding a new app as simple as possible
    - automatically pull docs from website during RAG onboarding?
    - maybe let user just pass in their OpenAPI spec and the app will automatically generate a chatbot for them
    - maybe use AI to scan the app's codebase - PostHog has an "AI setup wizard" that you can install like this: `npx @posthog/wizard@latest --region us`. This gives it access to your code.
    - Google has a [Chrome extension](https://chromewebstore.google.com/detail/project-mariner-companion/kadmollpgjhjcclemeliidekkajnjaih) where you can teach the AI how to perform tasks. Maybe you can create an extension that records HTTP requests and functions called on each click and turns them into actions.
    - maybe use some tool to autodiscover website endpoints/capabilities
    - brainstorm what the ideal frictionless onboarding would look like. Ideally the webapp owner doesn't have to do anything. We offer them a chatbot that just works.

# Strategy
- start off selling but think about what it takes to win big
- freemium model. generous free tier to win big market share and then make money on small portion of power users: https://youtu.be/K4s6Cgicw_A?si=eChQZbm-Vz8pIqt1&t=667 (this might require getting inference costs low. finding the cheapest models)
- what does open sourcing the codebase entirely or partially do? (look into case studies for when this has worked and when it hasn't. i think it only makes sense in certain cases)
- get advice from silicon valley investors and founders. they have a lot of experience with this
- raise money from the best silicon valley VCs so they have skin in the game and help us with their experience and network and drive
- the goal is to get someone on our team that’s super successful in what we’re doing. somebody that’s already done similar things and scaled to unicorn valuation

### Why not just General Agents?
- AGI isn't here yet. General agents can't figure out how to achieve everything the user wants on a website.
- Even when AGI gets here, the agent won't have instant knowledge of the app's capabilities (actions).
- This project needs to provide the agent instant access to all of the app's capabilities.
- This means a lot of our competitive advantage will be in reducing onboarding friction to a minimum.
- Minimizing onboarding friction will likely be done with AI/agents.


# Competition
- https://www.chatbase.co/
  - [custom actions](https://www.chatbase.co/docs/user-guides/chatbot/actions/custom-action)

# Design
The website design is based on this: https://gitingest.com/


# Notes

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


# Ideas
- tool fetching can maybe be made more accurate by inserting a RAG step (e.g. embed the tool information). how does the lib currently fetch under the hood? maybe it already does this?

# Development Notes

## Connect to Supabase Database with Your Favorite Postgres Client
- URL: `jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres`
- user: `postgres.pwlbhcjwuwsvszkvqexy`
- password: `[your Supabase password]`

## Autoupdate Dependencies
- update `pnpm` with `pnpm self-update`
- update all packages to latest versions with `pnpm update --latest`
- update all packages while respecting defined version ranges with `pnpm update`

## Format code with Prettier
```bash
pnpm format
```

## UI Components
This project uses [shadcn/ui](https://ui.shadcn.com/) components

## If You Want to Use a Local LLM Model From LM Studio
1. Install [LM Studio](https://lmstudio.ai/).
2. Download the `qwen3-8b` model in LM Studio.
3. Enable **Developer Mode** in LM Studio.
4. Start the LM Studio server to serve the model at `http://localhost:1234/v1`.
5. Set the `MODEL_PROVIDER` environment variable to `lmstudio`.
