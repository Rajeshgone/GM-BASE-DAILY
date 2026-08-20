# BaseGM for Vercel

BaseGM is a daily onchain GM app for Base. It sends a 0 ETH self-transaction with ERC-8021 attribution using Builder Code `bc_mlswv7u2`.

## Deploy to Vercel

1. Upload this project to a new GitHub repository.
2. In Vercel, select **Add New → Project** and import the repository.
3. Keep the detected framework as **Next.js** and click **Deploy**.
4. After Vercel assigns the final domain, optionally add `NEXT_PUBLIC_APP_URL` in **Project Settings → Environment Variables** and redeploy.

No private key, RPC key, or server secret is required.

## Farcaster later

The Farcaster Mini App SDK and wallet support are already included. The Farcaster manifest is intentionally not registered yet. Generate and sign the manifest only after the final Vercel or custom domain is selected, because Farcaster ownership signatures are domain-specific.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
