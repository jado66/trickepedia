// Seed data for WaiverProvider (IndexedDB)
// Uses a localStorage flag to ensure it only seeds once per browser profile.

import { WaiverTemplate, SignedWaiverRecord } from "./waiver-provider";
import { seedMembers } from "../students-seed";

export const WAIVER_SEED_FLAG_KEY = "__waiver_seed_done_v1"; // used by provider localStorage flag

function randomPastDate(maxDaysAgo: number): Date {
  const offset = Math.floor(Math.random() * maxDaysAgo);
  return new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
}

const baseFields = [
  { id: "f1", type: "text", label: "First Name", required: true },
  { id: "f2", type: "text", label: "Last Name", required: true },
  { id: "f3", type: "email", label: "Email", required: true },
  { id: "f4", type: "phone", label: "Phone", required: true },
];
const legalFields = [
  {
    id: "f5",
    type: "checkbox",
    label: "I understand the risks",
    required: true,
  },
  {
    id: "f6",
    type: "checkbox",
    label: "I agree to follow rules",
    required: true,
  },
  { id: "f7", type: "signature", label: "Signature", required: true },
  { id: "f8", type: "date", label: "Date Signed", required: true },
];

function makeTemplate(
  id: string,
  name: string,
  desc: string,
  expMonths: number | null,
  active = true,
  allowMinors = false
): WaiverTemplate {
  const today = new Date().toISOString().split("T")[0];
  return {
    id,
    name,
    description: desc,
    expirationMonths: expMonths,
    active,
    createdAt: today,
    lastUsed: null,
    allowMinors,
    maxMinors: allowMinors ? 3 : undefined,
    fieldGroups: [
      {
        id: `${id}-grp-personal`,
        name: "Participant Info",
        description: "Basic info",
        fields: baseFields,
      },
      {
        id: `${id}-grp-legal`,
        name: "Agreement",
        description: "Consent",
        fields: legalFields,
      },
    ],
    documents: [
      {
        id: `${id}-doc-terms`,
        type: "terms_conditions",
        title: "Terms & Conditions",
        content: "Standard liability release terms...",
        isRequired: true,
      },
    ],
    fieldCount: baseFields.length + legalFields.length,
  };
}

export const WAIVER_TEMPLATE_SEEDS: WaiverTemplate[] = [
  makeTemplate(
    "tpl-standard",
    "Standard Trampoline Waiver",
    "Basic liability waiver for trampoline activities",
    12,
    true,
    true
  ),
  makeTemplate(
    "tpl-climb",
    "Rock Climbing Waiver",
    "Comprehensive waiver for climbing and bouldering",
    6,
    true
  ),
  makeTemplate(
    "tpl-youth",
    "Youth Program Waiver",
    "Special waiver for participants under 18",
    null,
    false,
    true
  ),
];

export function buildSignedWaiverSeeds(): SignedWaiverRecord[] {
  const emailToId: Record<string, string> = {};
  seedMembers.forEach((m) => (emailToId[m.email.toLowerCase()] = m.id));

  function link(
    rec: Omit<SignedWaiverRecord, "id"> & { id?: string }
  ): SignedWaiverRecord {
    const memberId = rec.email ? emailToId[rec.email.toLowerCase()] : undefined;
    return {
      id: rec.id || crypto.randomUUID(),
      ...rec,
      memberId,
    } as SignedWaiverRecord;
  }

  // Utility helpers for varied expiration patterns
  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function futureDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  function pastDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  const membersSubset = seedMembers.slice(0, 32); // first 32 members get demo waivers

  const records: SignedWaiverRecord[] = [];

  membersSubset.forEach((m, idx) => {
    // Alternate templates between active ones
    const templateId = idx % 2 === 0 ? "tpl-standard" : "tpl-climb";
    const templateName =
      templateId === "tpl-standard"
        ? "Standard Trampoline Waiver"
        : "Rock Climbing Waiver";

    // Signed sometime in the past 180 days
    const signedAt = randomPastDate(180).toISOString();

    // Determine expiration pattern
    // Every 6th = expired, every 5th (but not 6th) = expiring soon, rest active far future
    let expiresAt: string | null;
    if (idx % 6 === 0) {
      // Expired 1-60 days ago
      expiresAt = pastDays(randomInt(1, 60));
    } else if (idx % 5 === 0) {
      // Expiring soon (1-10 days ahead)
      expiresAt = futureDays(randomInt(1, 10));
    } else {
      // Active far out (90-365 days)
      expiresAt = futureDays(randomInt(90, 365));
    }

    records.push(
      link({
        templateId,
        templateName,
        participantName: m.name,
        email: m.email,
        phone: m.phone,
        signedAt,
        expiresAt,
        status: "active", // will be recalculated on load
        minorCount: 0,
        archived: false,
      })
    );
  });

  // Add a couple of extra demo waivers for the same member to show multiple history
  if (membersSubset[0]) {
    const m = membersSubset[0];
    records.push(
      link({
        templateId: "tpl-standard",
        templateName: "Standard Trampoline Waiver",
        participantName: m.name,
        email: m.email,
        phone: m.phone,
        signedAt: randomPastDate(400).toISOString(),
        expiresAt: pastDays(200), // long expired
        status: "expired",
        minorCount: 0,
        archived: false,
      })
    );
  }

  return records;
}
