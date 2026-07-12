"use client";

import {
  Archive,
  BadgeCheck,
  ExternalLink,
  FolderLock,
  Link2,
  Loader2,
  Search,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  linkLockerAbi,
  linkLockerContractAddress,
  MAX_NOTE_LENGTH,
  MAX_PURPOSE_LENGTH,
  MAX_SOURCE_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_URL_LENGTH,
} from "@/lib/link-locker";

const PRESETS = [
  {
    title: "Base builder rewards notes",
    url: "https://docs.base.org/apps/growth/rewards",
    source: "Base docs",
    purpose: "submit checklist",
    note: "Keep this handy before submitting a new app, especially verification, builder code, and reward eligibility notes.",
  },
  {
    title: "Mobile wallet QA checklist",
    url: "https://docs.base.org/apps/quickstart/build-app",
    source: "quickstart",
    purpose: "pre-launch QA",
    note: "Use before shipping: open in Base App, connect wallet, sign, transact, refresh, and recover the result state.",
  },
  {
    title: "Tiny product copy swipe",
    url: "https://base.org/build",
    source: "builder page",
    purpose: "copy reference",
    note: "Save concise words and examples that explain a Base app without turning the first screen into marketing.",
  },
] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid title")) return "Title needs 1 to 56 characters.";
  if (error.message.includes("Invalid url")) return "URL needs 1 to 160 characters.";
  if (error.message.includes("Invalid source")) return "Source needs 1 to 36 characters.";
  if (error.message.includes("Invalid purpose")) return "Purpose needs 1 to 36 characters.";
  if (error.message.includes("Invalid note")) return "Note needs 1 to 180 characters.";
  return error.message;
}

function LinkCard({
  title,
  url,
  source,
  purpose,
  note,
  maker,
  createdAt,
}: {
  title: string;
  url: string;
  source: string;
  purpose: string;
  note: string;
  maker?: Address;
  createdAt?: bigint;
}) {
  return (
    <article className="link-stage">
      <div className="tab-strip" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header className="link-head">
        <div>
          <p className="eyebrow">Link Locker</p>
          <h2>{title || "Untitled link"}</h2>
        </div>
        <div className="lock-mark">
          <FolderLock />
        </div>
      </header>

      <section className="url-box">
        <span>Saved URL</span>
        <strong>{url || "--"}</strong>
      </section>

      <section className="link-meta">
        <div>
          <span>Source</span>
          <strong>{source || "--"}</strong>
        </div>
        <div>
          <span>Purpose</span>
          <strong>{purpose || "--"}</strong>
        </div>
      </section>

      <section className="note-box">
        <span>Context note</span>
        <p>{note || "Save a useful link with context on Base."}</p>
      </section>

      <footer className="link-foot">
        <div>
          <Wallet />
          <span>{shortAddress(maker)}</span>
        </div>
        <div>
          <BadgeCheck />
          <span>{formatDate(createdAt)}</span>
        </div>
      </footer>
    </article>
  );
}

export function LinkLockerApp() {
  const [linkIdInput, setLinkIdInput] = useState("1");
  const [title, setTitle] = useState<string>(PRESETS[0].title);
  const [url, setUrl] = useState<string>(PRESETS[0].url);
  const [source, setSource] = useState<string>(PRESETS[0].source);
  const [purpose, setPurpose] = useState<string>(PRESETS[0].purpose);
  const [note, setNote] = useState<string>(PRESETS[0].note);
  const [message, setMessage] = useState("Save one useful link on Base.");
  const [lastAction, setLastAction] = useState<"save" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedLinkId = BigInt(Math.max(1, Number(linkIdInput || "1")));

  const linkQuery = useReadContract({
    abi: linkLockerAbi,
    address: linkLockerContractAddress,
    functionName: "getLink",
    args: [parsedLinkId],
    query: { enabled: Boolean(linkLockerContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: linkLockerAbi,
    address: linkLockerContractAddress,
    functionName: "nextLinkId",
    query: { enabled: Boolean(linkLockerContractAddress), refetchInterval: 12000 },
  });

  const tuple = linkQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const liveLink = useMemo(
    () =>
      tuple
        ? {
            maker: tuple[0],
            title: tuple[1],
            url: tuple[2],
            source: tuple[3],
            purpose: tuple[4],
            note: tuple[5],
            createdAt: tuple[6],
          }
        : undefined,
    [tuple],
  );

  const totalLinks = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    url.trim().length > 0 &&
    url.trim().length <= MAX_URL_LENGTH &&
    source.trim().length > 0 &&
    source.trim().length <= MAX_SOURCE_LENGTH &&
    purpose.trim().length > 0 &&
    purpose.trim().length <= MAX_PURPOSE_LENGTH &&
    note.trim().length > 0 &&
    note.trim().length <= MAX_NOTE_LENGTH;

  const saveBlocker = !linkLockerContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_LINK_LOCKER_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill title, URL, source, purpose, and note."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "save") return;
    void totalQuery.refetch();
    void linkQuery.refetch();
    const logs = parseEventLogs({ abi: linkLockerAbi, logs: receipt.logs, eventName: "LinkSaved" });
    const linkId = logs[0]?.args.linkId;
    window.setTimeout(() => {
      if (linkId) setLinkIdInput(linkId.toString());
      setMessage(linkId ? `Link #${linkId.toString()} saved on Base.` : "Link saved on Base.");
    }, 0);
  }, [lastAction, receipt, totalQuery, linkQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setMessage("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setMessage("Wallet connected. Save the link when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(friendlyError(lastError));
  }

  async function saveLink() {
    const contractAddress = linkLockerContractAddress;
    if (saveBlocker) {
      setMessage(saveBlocker);
      return;
    }
    if (!contractAddress) {
      setMessage("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("save");
      setMessage("Confirm the link save in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: linkLockerAbi,
        functionName: "saveLink",
        args: [title.trim(), url.trim(), source.trim(), purpose.trim(), note.trim()],
        chainId: base.id,
      });
      setMessage("Link sent. Waiting for Base confirmation...");
    } catch (error) {
      setMessage(friendlyError(error));
    }
  }

  function applyPreset(index: number) {
    const preset = PRESETS[index];
    setTitle(preset.title);
    setUrl(preset.url);
    setSource(preset.source);
    setPurpose(preset.purpose);
    setNote(preset.note);
  }

  return (
    <main className="min-h-screen bg-[#eef3ff] text-[#10182f]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <aside className="locker-dock">
          <header className="dock-head">
            <div>
              <p className="eyebrow">Link Locker</p>
              <h1>Save one useful link.</h1>
            </div>
            <div className="dock-badge">
              <Archive aria-hidden="true" />
            </div>
          </header>

          <section className="mini-stats">
            <div>
              <span>Links</span>
              <strong>{totalLinks}</strong>
            </div>
            <div>
              <span>Chain</span>
              <strong>Base</strong>
            </div>
          </section>

          <section className="locker-form">
            <div className="form-title">
              <Link2 aria-hidden="true" />
              <h2>New link</h2>
            </div>
            <div className="preset-row">
              {PRESETS.map((preset, index) => (
                <button key={preset.title} onClick={() => applyPreset(index)}>
                  {index + 1}
                </button>
              ))}
            </div>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={MAX_TITLE_LENGTH} />
            </label>
            <label>
              <span>URL</span>
              <input value={url} onChange={(event) => setUrl(event.target.value)} maxLength={MAX_URL_LENGTH} />
            </label>
            <label>
              <span>Source</span>
              <input value={source} onChange={(event) => setSource(event.target.value)} maxLength={MAX_SOURCE_LENGTH} />
            </label>
            <label>
              <span>Purpose</span>
              <input value={purpose} onChange={(event) => setPurpose(event.target.value)} maxLength={MAX_PURPOSE_LENGTH} />
            </label>
            <label>
              <span>Note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={MAX_NOTE_LENGTH} rows={4} />
            </label>
          </section>

          <section className="action-stack">
            {isConnected && chainId !== base.id ? (
              <button className="primary warn" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button className="primary" disabled={writing || confirming} onClick={saveLink}>
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Save on Base
              </button>
            )}
            {isConnected ? (
              <button className="secondary" onClick={disconnectWallet}>
                {shortAddress(address)}
              </button>
            ) : (
              <button className="secondary" disabled={!selectedConnector || connecting} onClick={connectWallet}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}
            <p className="status">{message}</p>
            {hash ? (
              <a className="tx-link" href={`https://basescan.org/tx/${hash}`} rel="noreferrer" target="_blank">
                View transaction on BaseScan
              </a>
            ) : null}
          </section>
        </aside>

        <section className="view-stack">
          <LinkCard
            title={liveLink?.title || title}
            url={liveLink?.url || url}
            source={liveLink?.source || source}
            purpose={liveLink?.purpose || purpose}
            note={liveLink?.note || note}
            maker={liveLink?.maker}
            createdAt={liveLink?.createdAt}
          />

          <div className="lower-grid">
            <section className="load-panel">
              <div>
                <Search aria-hidden="true" />
                <h2>Load link</h2>
              </div>
              <label>
                <span>Link ID</span>
                <input value={linkIdInput} onChange={(event) => setLinkIdInput(event.target.value.replace(/\D/g, ""))} />
              </label>
            </section>

            <section className="about-panel">
              <p className="eyebrow">What it does</p>
              <p>
                Link Locker saves a useful URL with title, source, purpose, note, wallet, and timestamp on Base.
              </p>
              <div>
                <span><Link2 aria-hidden="true" /> URL</span>
                <span><FolderLock aria-hidden="true" /> Context</span>
                <span><BadgeCheck aria-hidden="true" /> On Base</span>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
