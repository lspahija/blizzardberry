# Vision
**Empower anybody to add a natural language interface to existing software. </br> Support voice. </br> 
Liberate people from screens. </br> Allow them to perform actions on a computer just by stating their intentions.**

# Value Proposition
The easiest way to get something done on a computer is to have someone else do it for you.
</br>
Unfortunately, that other person is not always available.
</br>
Our AI agent replaces that other person entirely.

Give your users the pleasure of using your software with the best possible interface: natural language.

# Ultimate Requirements
- allow AI agent to immediately find the right action and execute it (no exploration phase)
- immediately add new AI models (as AI models improve, the usefulness of this product should automatically improve in parallel)
- onboard new apps with minimal friction (ideally automatically)
- support any software (web apps, desktop apps, mobile apps, terminal apps, etc)

# Design
The website design is based on this: https://gitingest.com/

this looks good: https://bland.com/

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

3. **Team Member Imports Your Public Key**  
   The team member will import your public key into their GPG keyring:
   ```bash
   gpg --import your-name-public-key.asc
   ```

4. **Team Member Trusts Your Public Key**  
   The team member must trust the imported key before it can be used:
   ```bash
   gpg --edit-key <your-email>
   ```
   This opens an interactive GPG session. Then:
   - Type `trust` and press Enter
   - Select `5` (ultimate trust) or `4` (full trust)
   - Type `quit` to exit

5. **Team Member Adds You to git-crypt**  
   The team member will add you to git-crypt with:
   ```bash
   git-crypt add-gpg-user <your-email>
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