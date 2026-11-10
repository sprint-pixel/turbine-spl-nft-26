import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  signTransactionWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

//import your wallet
import wallet from "../../devnet-wallet.json";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  try {
    const feePayer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
    const signer = await generateKeyPairSigner();

    const mintSpace = getMintSize();
    const rentLamports = await rpc.getMinimumBalanceForRentExemption(BigInt(mintSpace)).send();

    const createMintAccountIx = getCreateAccountInstruction({ //create the mint account here
      payer:feePayer,
      newAccount:signer,
      lamports:rentLamports,
      space:mintSpace,
      programAddress: TOKEN_PROGRAM_ADDRESS
    })

    const initializeMintIx = getInitializeMintInstruction( //initializing the instruction here
      {
        mint:signer.address,
        decimals: 6,
        mintAuthority: feePayer.address,
        freezeAuthority:null,
      }

    )

    const {value: latestBlockhash} = await rpc.getLatestBlockhash().send();

    const message = createTransactionMessage({version: 0});
    const messageWithPayer = setTransactionMessageFeePayerSigner(
      feePayer,
      message
    )

    const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      messageWithPayer
    )

    const transactionMessage = appendTransactionMessageInstructions(
      [createMintAccountIx,initializeMintIx],
      messageWithLifetime,
    );

    const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);

    assertIsTransactionWithBlockhashLifetime(signedTransaction);

    const signature = getSignatureFromTransaction(signedTransaction)
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions
    });

    await sendAndConfirm(signedTransaction, {commitment: "confirmed"});

    console.log(`Mint address: ${signer.address}`);
    console.log(`Transaction signature is: ${signature}`);
   
  } catch (error) {
    console.log(error);
  }
})();
