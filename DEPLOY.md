# Link Locker Deployment Notes

App Name: Link Locker
Tagline: Save useful URLs
Description: Save a useful URL with title, source, purpose, note, wallet, and timestamp on Base.

## After Base Gives `base:app_id`

Copy the meta tag to Codex. The app id must be written to:

- `src/app/layout.tsx`
- `.env.local`
- `Vercel.txt`
- Vercel Production env `NEXT_PUBLIC_BASE_APP_ID`

Then deploy once with the project token in `Vercel.txt`, deploy the contract, and write the contract address to:

- `.env.local`
- `Vercel.txt`
- Vercel Production env `NEXT_PUBLIC_LINK_LOCKER_CONTRACT_ADDRESS`

## After Base Gives Builder Code

Write the Builder Code to:

- `.env.local`
- `Vercel.txt`
- Vercel Production env `NEXT_PUBLIC_BUILDER_CODE`

Then run production deploy again.

## Required Vercel Production Env

```bash
NEXT_PUBLIC_BASE_APP_ID=6a0ae6abe317310c39c9c1b9
NEXT_PUBLIC_BUILDER_CODE=replace_with_builder_code
NEXT_PUBLIC_LINK_LOCKER_CONTRACT_ADDRESS=replace_with_link_locker_contract_address
```

## Contract

```bash
npm run deploy:contract
```
