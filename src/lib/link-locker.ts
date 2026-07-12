import type { Address } from "viem";

export const MAX_TITLE_LENGTH = 56;
export const MAX_URL_LENGTH = 160;
export const MAX_SOURCE_LENGTH = 36;
export const MAX_PURPOSE_LENGTH = 36;
export const MAX_NOTE_LENGTH = 180;

export const linkLockerAbi = [
  {
    type: "event",
    name: "LinkSaved",
    inputs: [
      { name: "linkId", type: "uint256", indexed: true },
      { name: "maker", type: "address", indexed: true },
      { name: "title", type: "string", indexed: false },
      { name: "url", type: "string", indexed: false },
      { name: "source", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "saveLink",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "url", type: "string" },
      { name: "source", type: "string" },
      { name: "purpose", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [{ name: "linkId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getLink",
    stateMutability: "view",
    inputs: [{ name: "linkId", type: "uint256" }],
    outputs: [
      { name: "maker", type: "address" },
      { name: "title", type: "string" },
      { name: "url", type: "string" },
      { name: "source", type: "string" },
      { name: "purpose", type: "string" },
      { name: "note", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextLinkId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredLinkLockerContractAddress =
  process.env.NEXT_PUBLIC_LINK_LOCKER_CONTRACT_ADDRESS?.trim();

export const linkLockerContractAddress = isAddressLike(configuredLinkLockerContractAddress)
  ? (configuredLinkLockerContractAddress as Address)
  : undefined;
