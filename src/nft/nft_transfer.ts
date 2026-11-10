import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset, mplCore, transfer } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import wallet from "../../devnet-wallet.json";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

const assetAddress = publicKey("5xzzfHMMAB7z6UShL7p9rnhNJC61t7MwVUJj1tX5v6eD");

(async () => {
  try {
    const recipientAddress = process.env.NFT_RECIPIENT_ADDRESS;
    if (!recipientAddress) {
      throw new Error(
        "Set NFT_RECIPIENT_ADDRESS to the recipient wallet's public address.",
      );
    }

    const newOwner = publicKey(recipientAddress);
    if (newOwner === signer.publicKey) {
      throw new Error("The recipient must be a different wallet.");
    }

    const asset = await fetchAsset(umi, assetAddress);
    if (asset.owner !== signer.publicKey) {
      throw new Error(
        `This wallet does not own the asset; Current owner: ${asset.owner}`,
      );
    }

    const result = await transfer(umi, {
      asset,
      authority: signer,
      newOwner,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(result.signature)[0];
    console.log(`NFT transferred to ${newOwner}. Signature: ${signature}`);
  } catch (error) {
    console.error("Failed to transfer MPL Core NFT:", error);
  }
})();
