import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import wallet from "../../devnet-wallet.json";

const umi = createUmi(
    process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
)

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet))
const  signer = createSignerFromKeypair(umi,keypair)

umi.use(signerIdentity(signer));
umi.use(mplCore());

const assetAddress = publicKey("5xzzfHMMAB7z6UShL7p9rnhNJC61t7MwVUJj1tX5v6eD")

const metadataUri = "https://gateway.irys.xyz/54DSuz9TtDcv7FaoS4NJm61HfDooFs9w819PHJyCBsBs";

(async ()=>{
    try{
        const asset = await fetchAsset(umi, assetAddress);
        const result = await update(umi,{
            asset,
            authority:signer,
            name:"This is my updated NFT",
            uri: metadataUri
        }).sendAndConfirm(umi);

        const signature = base58.deserialize(result.signature)[0];
        console.log(`NFT updated. Signature: ${signature}`);
    }
    catch(e){
        console.error("Failed to update..", e);
    }
})();