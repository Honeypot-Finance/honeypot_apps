# HoneypotFrontend

## Create next app workspace


```sh
npx create-nx-workspace@latest --preset=next
```

## Run tasks

To run the dev server for your app, use:

```sh
npx nx dev <app-name>
```

To create a production bundle:

```sh
npx nx build <app-name> --prod
```

To see all available targets to run for a project, run:

```sh
npx nx show project apps/<app-name>
```

## To generate a new app, use:

```sh
npx nx g @nx/next:app apps/<app-name>

# Create next app without app router and src directory
✔ What unit test runner should be used? · none
✔ Which E2E test runner would you like to use? · none
✔ Would you like to use the App Router (recommended)? (Y/n) · false
✔ Would you like to use `src/` directory? (Y/n) · false
```

## To generate a new library, use:

```sh
npx nx generate @nrwl/react:lib libs/<lib-name>

```

## Import library in app:

In the history reason, we need add paths value in every app tsconfig.json, and the tsconfig.base.json will override by app's tsconfig.json path value.
You must add this this import in every app you want to use this library.

```
#example add this line in apps/wasabee/tsconfig.json -> compilerOptions.paths
#@honeypot/shared this just for example, you can set other name for this import

"@honeypot/shared": ["../../libs/shared/src/index.ts"]

#use
import { Example } from '@honeypot/shared';

```

## add or update env in github

1. open https://github.com/Honeypot-Finance/honeypot_apps/settings/secrets/actions
2. Click 'Add repository secret'

## pull vercel env to local

```sh
pnpm install -g vercel

cd apps/<app-name>

vercel link

? Set up “~/Documents/Code/Honeypot/honeypot_apps/apps/wasabee”? yes
? Which scope should contain your project? YexLabs
? Link to existing project? yes
? What’s the name of your existing project? apps-<app-name>

vercel env pull .env.local --environment production
```

## create graphql code

```sh
cd apps/<app-name>
npx graphql-codegen --config algebra_codegen.ts
```

## generate wagmi client

```sh
sudo pnpm wagmi generate --root apps/<app-name>
```
