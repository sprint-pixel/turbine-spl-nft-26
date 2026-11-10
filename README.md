# Solana SPL Token and MPL Core NFT

A small TypeScript project for learning how to create and use an SPL token and
an NFT on Solana Devnet. It uses Solana Kit for SPL-token transactions, Umi and
Metaplex Core for NFT operations, and Irys for image and JSON uploads.

## Verified Devnet transactions

These public transaction links document the completed assignment steps.

| Step | Transaction |
|---|---|
| Initialize the six-decimal SPL mint [`D8PG2SWbB1EPArWV8PCzsFRew4JAFHbTnK12JFUbJmDq`](https://explorer.solana.com/address/D8PG2SWbB1EPArWV8PCzsFRew4JAFHbTnK12JFUbJmDq?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/dLFnWm6upaxnDX97cbSpp8nCtCpu4Vn4NJ4NnVZyxsLtvFWm2fhyPuBbW2nECDxbixxzNsjFzgYajfRoA8mJR3s?cluster=devnet) |
| Mint five SPL tokens | [View transaction](https://explorer.solana.com/tx/5Nq5LH2eqZnYJhTRweijRS5LTEQnLakxyMLSU5vd3e9REasEv9ED2nSYg3eNaCBiXD4pK4nQSpKLbBddD57g997X?cluster=devnet) |
| Transfer one SPL token | [View transaction](https://explorer.solana.com/tx/3SfBKaLZ8Vvc8XkitBEgkTQeMUeaNtfCDoPM2ywn6DfSqcjYJdZMKFVWZvGL3LtDm3jvEkE7wpiwCnHZjRuSJq7z?cluster=devnet) |
| Mint MPL Core NFT [`5xzzfHMMAB7z6UShL7p9rnhNJC61t7MwVUJj1tX5v6eD`](https://explorer.solana.com/address/5xzzfHMMAB7z6UShL7p9rnhNJC61t7MwVUJj1tX5v6eD?cluster=devnet) | [View transaction](https://explorer.solana.com/tx/3siAzAcvLCdapSjfFHyM6Z8WidJivvo2yBGCa8y3BFcp77zdw33pTgWHjyYWL3ZCiZwo6CpBfdP8faLpU31FYF2S?cluster=devnet) |
| Update NFT name and metadata | [View transaction](https://explorer.solana.com/tx/4xDdungULVy5yMMTPbtQ6LfB7CEYLLhjURVimdH8RAhURdq8Q78R3avPuivB9zVz9xMNoMABKXC6JbruDBMW9fMW?cluster=devnet) |
| Transfer NFT ownership | [View transaction](https://explorer.solana.com/tx/2R3R2y75siTeQt9DsNi43QCHzLqXehMPWroCpmvjJj6Q6RqHtC1B3B3b2YUFSpCa9LA4SgjcLkPjaYBDgPtZQyCm?cluster=devnet) |

The SPL mint has six decimal places: `1_000_000` base units equals one whole
token. The SPL mint transaction minted five tokens and the transfer sent one.
The optional NFT burn challenge was not implemented.

## Assignment progress

| Requirement | Status | What this project does |
|---|---|---|
| Mint and transfer an SPL token | Complete | Creates a six-decimal mint, mints five tokens to the wallet's associated token account, and transfers one token to another wallet. |
| Mint an NFT using MPL Core | Complete | Uploads image metadata to Irys and creates a Core asset on Devnet. |
| Update the NFT's name and metadata as update authority | Complete | Fetches the existing asset and updates its name and URI using the authority wallet. |
| Transfer NFT ownership between wallets (optional) | Complete | Transferred the existing Core asset to the recipient wallet on Devnet. |
| Permanently destroy the NFT and reclaim rent (optional) | Not implemented | This project does not include NFT burn functionality. |

## Requirements and setup

- Node.js and npm
- A Solana Devnet wallet with Devnet SOL for transaction fees and account rent
- An image file at the project root named `nft-image.jpeg` if running the NFT upload flow

Install the locked dependencies from the project root:

```bash
npm ci
```

Create a dedicated Devnet keypair at the project root as `devnet-wallet.json`.
For example, with the Solana CLI:

```bash
solana-keygen new --outfile devnet-wallet.json
```

Fund its public address with Devnet SOL. Keep the keypair private. The wallet
file is ignored by Git; never commit it, paste it into a post, or use a
mainnet-funded wallet for these scripts.

## Running the scripts

Run commands from the project root. Scripts submit real transactions or upload
files to Devnet/Irys; review the wallet, addresses, amounts, and URIs before
running them.

### SPL token flow

```bash
npm run spl:init
npm run spl:mint
npm run spl:transfer
```

1. `spl:init` creates a mint and prints its address and transaction signature.
   It generates a new mint each run.
2. Before running `spl:mint`, set its `mint` constant to the address printed by
   `spl:init`. The mint script creates the wallet's associated token account
   and mints five tokens.
3. Before running `spl:transfer`, set its `mint` constant to the same mint
   address and verify the `to` constant is the intended recipient's **wallet
   public address**. The script creates the recipient's associated token
   account and transfers one token.
4. Save the printed transaction signatures and verify them on Devnet Explorer.

The mint and recipient addresses are currently configured in the scripts for
the Devnet run documented above. If you create a different mint or choose a
different recipient, update those constants before running dependent scripts.

### NFT flow

The upload scripts should be run before the initial mint when creating a new
NFT:

```bash
npm run nft:image
npm run nft:metadata
npm run nft:mint
```

Use the image URI printed by `nft:image` in `nft_metadata.ts`, then use the
metadata URI printed by `nft:metadata` in `nft_mint.ts`.

To update the existing Core NFT instead of minting another one, update the
metadata JSON and upload it with `npm run nft:metadata`. Put the returned URI
in `src/nft/nft_update.ts`, check its asset address, and run:

```bash
npx ts-node src/nft/nft_update.ts
```

The update script signs with the wallet configured as the asset's update
authority and prints the confirmed transaction signature.

### Optional Core NFT ownership transfer

The transfer script targets the documented NFT asset. Set
`NFT_RECIPIENT_ADDRESS` in `.env` to the recipient's **public wallet address**,
then run:

```bash
npm run nft:transfer
```

The source wallet must currently own the asset and pay the transaction fee.
Once the transfer is confirmed, the recipient becomes the owner and the source
wallet can no longer transfer that asset. Verify the current owner on Devnet
Explorer before trying to transfer it again.

## What I learned

- A mint account defines a token's supply, authority, and decimal precision;
  token balances are held in associated token accounts.
- Token instruction amounts use integer base units, so decimal places must be
  accounted for when minting or transferring whole tokens.
- Solana transactions bundle ordered instructions, are signed by the required
  authorities, and must be confirmed on the target cluster.
- An NFT's off-chain JSON URI and its on-chain asset are separate: uploading
  new JSON does not change the NFT until its update authority submits an
  on-chain update.
- Public transaction signatures make Devnet work independently verifiable.

## Useful documentation

- [Solana tokens](https://solana.com/docs/tokens)
- [Solana Kit](https://www.solanakit.com/)
- [Metaplex Core](https://www.metaplex.com/docs/smart-contracts/core)
- [Metaplex Umi](https://www.metaplex.com/docs/dev-tools/umi)
