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
- create new SDKs for different languages so an agent can be added to any app
- onboard new apps with minimal friction


# Design
The website design is based on this: https://gitingest.com/

this looks good: https://bland.com/

https://basecamp.com/
https://www.hey.com/


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

# Use Agent

See an example SaaS app with integrated agent at http://localhost:3000/example-saas

# Deploy

Currently deployed to Vercel at https://blizzardberry.com/. App deploys automatically on every push to the `main` branch.


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

## Run Tests
```bash
pnpm test
```

## UI Components
This project uses [shadcn/ui](https://ui.shadcn.com/) components

## If You Want to Use a Local LLM Model From LM Studio
1. Install [LM Studio](https://lmstudio.ai/).
2. Download the `qwen3-8b` model in LM Studio.
3. Enable **Developer Mode** in LM Studio.
4. Start the LM Studio server to serve the model at `http://localhost:1234/v1`.
5. Set the `MODEL_PROVIDER` environment variable to `lmstudio`.