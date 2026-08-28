
"use client";

import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const BASE_CHAIN_ID = "0x2105";
const BUILDER_CODE = "bc_snyv7frr";
const ERC_8021_MARKER = "80218021802180218021802180218021";
type AppStatus = "idle" | "connecting" | "ready" | "confirming" | "pending" | "success" | "error";

function attributionSuffix(code: string) {
  const bytes = new TextEncoder().encode(code);
  const codeHex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${codeHex}${bytes.length.toString(16).padStart(2, "0")}00${ERC_8021_MARKER}`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<AppStatus>("idle");
  const [message, setMessage] = useState("Connect your wallet to say GM.");
  const [txHash, setTxHash] = useState("");
  const [gmCount, setGmCount] = useState(0);

  const hasSaidGm = useMemo(() => {
    if (!address || typeof localStorage === "undefined") return false;
    return localStorage.getItem(`basegm:${address.toLowerCase()}:${todayKey()}`) === "1";
  }, [address, status]);

  useEffect(() => {
    setGmCount(Number(localStorage.getItem("basegm:count") ?? "0"));
    const isMiniApp = new URLSearchParams(window.location.search).get("miniApp") === "true";
    if (isMiniApp) {
      sdk.actions.ready().catch(() => {
        // Continue rendering if a client opens the URL outside Farcaster.
      });
    }
  }, []);

  async function getProvider(): Promise<EthereumProvider> {
    // On the Vercel website, use the browser-injected wallet first.
    if (window.ethereum) return window.ethereum;

    const isMiniApp = new URLSearchParams(window.location.search).get("miniApp") === "true";
    if (isMiniApp) {
      try {
        const miniAppProvider = await sdk.wallet.getEthereumProvider();
        if (miniAppProvider) return miniAppProvider as EthereumProvider;
      } catch {
        // Show the actionable wallet message below.
      }
    }

    throw new Error("Open this Mini App in Farcaster or install Coinbase Wallet, MetaMask, or Rabby.");
  }

  async function ensureBase(provider: EthereumProvider) {
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_ID }] });
    } catch (error) {
      if ((error as { code?: number }).code !== 4902) throw error;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: BASE_CHAIN_ID,
          chainName: "Base",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"],
        }],
      });
    }
  }

  async function connectWallet() {
    setStatus("connecting");
    setMessage("Opening your wallet…");
    try {
      const provider = await getProvider();
      await ensureBase(provider);
      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts[0]) throw new Error("No wallet account selected.");
      setAddress(accounts[0]);
      setStatus("ready");
      setMessage("Connected to Base. Ready for today’s GM.");
    } catch (error) {
      setStatus("error");
      setMessage((error as Error).message || "Wallet connection was cancelled.");
    }
  }

  async function sayGm() {
    if (!address) return connectWallet();
    setStatus("confirming");
    setMessage("Confirm the low-cost transaction in your wallet…");
    setTxHash("");
    try {
      const provider = await getProvider();
      await ensureBase(provider);
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: address, to: address, value: "0x0", data: attributionSuffix(BUILDER_CODE) }],
      }) as string;
      setTxHash(hash);
      setStatus("pending");
      setMessage("GM sent. Waiting for Base confirmation…");

      let receipt: unknown = null;
      for (let attempt = 0; attempt < 30 && !receipt; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        receipt = await provider.request({ method: "eth_getTransactionReceipt", params: [hash] });
      }

      localStorage.setItem(`basegm:${address.toLowerCase()}:${todayKey()}`, "1");
      const nextCount = gmCount + 1;
      localStorage.setItem("basegm:count", String(nextCount));
      setGmCount(nextCount);
      setStatus("success");
      setMessage(receipt ? "GM confirmed on Base. See you tomorrow!" : "GM submitted to Base.");
    } catch (error) {
      setStatus("error");
      setMessage((error as Error).message || "The transaction was cancelled.");
    }
  }

  const busy = ["connecting", "confirming", "pending"].includes(status);

  return (
    <main className="app-shell">
      <div className="orb orb-one" /><div className="orb orb-two" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BaseGM home"><span className="brand-mark">GM</span><span>BaseGM</span></a>
        <span className="network-pill"><i /> Base Mainnet</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span>☀</span> Your daily onchain hello</div>
        <h1>Say GM.<br /><em>Make it onchain.</em></h1>
        <p className="hero-copy">A tiny daily ritual on Base. Connect, say GM, and create a verifiable onchain moment for only the network gas fee.</p>

        <div className="gm-card">
          <div className="sun-wrap" aria-hidden="true"><div className="sun">☀</div></div>
          <div className="card-heading"><span className="label">TODAY’S CHECK-IN</span><h2>{hasSaidGm || status === "success" ? "GM, legend!" : "Ready to say GM?"}</h2></div>
          {address ? <div className="wallet-row"><span className="wallet-dot" /><span>Connected</span><strong>{shortAddress(address)}</strong></div> : null}
          <button className="gm-button" onClick={address ? sayGm : connectWallet} disabled={busy}>
            {busy ? <span className="spinner" /> : <span>{address ? "☀" : "↗"}</span>}
            {status === "connecting" ? "Connecting…" : status === "confirming" ? "Confirm in wallet" : status === "pending" ? "Confirming on Base" : address ? "Say GM on Base" : "Connect wallet"}
          </button>
          <p className={`status ${status === "error" ? "is-error" : ""}`}>{message}</p>
          {txHash ? <a className="tx-link" href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer">View transaction ↗</a> : null}
          <div className="stats-row"><div><strong>{gmCount}</strong><span>Your GMs</span></div><div><strong>0 ETH</strong><span>Amount sent</span></div><div><strong>Base</strong><span>Network</span></div></div>
        </div>
        <p className="trust-note"><span>✓</span> No contract approval &nbsp;·&nbsp; No funds transferred &nbsp;·&nbsp; You only pay gas</p>
      </section>

      <footer><span>Built for the Base ecosystem</span><span className="builder-code">Attributed with ERC-8021</span></footer>
    </main>
  );
}
