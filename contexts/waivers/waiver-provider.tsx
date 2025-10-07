"use client";

import { create } from "zustand";
import { useGymStore } from "@/contexts/gym/gym-provider"; // Import the gym store for cross-access
import {
  initGymDB,
  getAll,
  putItem,
  deleteItem,
  STORE,
  getById,
  bulkPut,
  clearStore,
} from "@/contexts/gym/gym-db";
import {
  WAIVER_TEMPLATE_SEEDS,
  buildSignedWaiverSeeds,
  WAIVER_SEED_FLAG_KEY,
} from "./waiver-seed";

// Types specific to Waiver domain (distinct from legacy WaiverItem used in gym management list)
export interface WaiverTemplate {
  id: string;
  name: string;
  description: string;
  fieldCount: number; // derived from fieldGroups
  expirationMonths: number | null; // null => never expires
  active: boolean;
  createdAt: string; // ISO yyyy-mm-dd
  lastUsed: string | null; // ISO or null
  allowMinors?: boolean;
  maxMinors?: number;
  fieldGroups: FieldGroup[]; // full structure used by editor & signing
  documents: WaiverDocument[];
}

export interface FieldGroup {
  id: string;
  name: string;
  description: string;
  fields: any[]; // keep flexible; future: refine discriminated union
}

export interface WaiverDocument {
  id: string;
  type: string; // e.g. terms_conditions, media_consent
  title: string;
  content: string;
  isRequired: boolean;
  orderIndex?: number;
}

export interface SignedWaiverRecord {
  id: string;
  templateId: string;
  templateName: string;
  participantName: string;
  email: string;
  phone?: string;
  signedAt: string; // ISO datetime
  expiresAt: string | null; // ISO datetime or null
  status: "active" | "expired";
  // Minimal metadata only; full submission (form fields, signature BLOB) will be attached to user later.
  minorCount?: number;
  archived?: boolean;
  // Link to a member record (added in v2). Optional for legacy waivers.
  memberId?: string;
}

interface WaiverStore {
  loading: boolean;
  templates: WaiverTemplate[];
  signedWaivers: SignedWaiverRecord[]; // excludes archived
  archivedWaivers: SignedWaiverRecord[];
  // Actions
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  // Template CRUD
  createTemplate: (
    partial: Omit<
      WaiverTemplate,
      "id" | "createdAt" | "lastUsed" | "fieldCount"
    >
  ) => Promise<WaiverTemplate>;
  updateTemplate: (
    id: string,
    partial: Partial<WaiverTemplate>
  ) => Promise<WaiverTemplate | null>;
  duplicateTemplate: (id: string) => Promise<WaiverTemplate | null>;
  toggleTemplateActive: (id: string) => Promise<WaiverTemplate | null>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => WaiverTemplate | undefined;
  // Signing
  signWaiver: (input: {
    templateId: string;
    participantName: string;
    email: string;
    phone?: string;
    minorCount?: number;
  }) => Promise<SignedWaiverRecord | null>;
  archiveWaiver: (id: string) => Promise<SignedWaiverRecord | null>;
  unarchiveWaiver: (id: string) => Promise<SignedWaiverRecord | null>;
  deleteWaiver: (id: string) => Promise<void>;
  // Resets
  resetWaivers: () => Promise<void>; // clears all waiver data (no reseed)
  resetWaiversToSeed: () => Promise<void>; // clears and reseeds demo data
  // Derived stats
  stats: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
  };
  // Linking helpers
  getWaiversByMemberId: (memberId: string) => SignedWaiverRecord[];
  getPrimaryWaiverStatus: (memberId: string) => {
    label: string;
    state: string;
    waiver?: SignedWaiverRecord;
  };
}

// Helpers
function computeExpiresAt(template: WaiverTemplate): string | null {
  if (template.expirationMonths == null) return null;
  const now = new Date();
  now.setMonth(now.getMonth() + template.expirationMonths);
  return now.toISOString();
}

function deriveStatus(expiresAt: string | null): "active" | "expired" {
  if (!expiresAt) return "active";
  return new Date(expiresAt).getTime() < Date.now() ? "expired" : "active";
}

// Evaluate waiver state with additional nuance (expiringSoon)
function evaluateWaiverState(w: SignedWaiverRecord) {
  if (w.archived) return { state: "archived" as const };
  if (
    w.status === "expired" ||
    (w.expiresAt && new Date(w.expiresAt) < new Date())
  )
    return { state: "expired" as const };
  if (w.expiresAt) {
    const msLeft = new Date(w.expiresAt).getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / 86400000);
    if (daysLeft <= 14) return { state: "expiringSoon" as const, daysLeft };
  }
  return { state: "active" as const };
}

export const useWaiverStore = create<WaiverStore>()((set, get) => ({
  loading: true,
  templates: [],
  signedWaivers: [],
  archivedWaivers: [],
  stats: {
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
  },
  getWaiversByMemberId: (memberId: string) =>
    get().signedWaivers.filter((w) => w.memberId === memberId),
  getPrimaryWaiverStatus: (memberId: string) => {
    let list = get().signedWaivers.filter((w) => w.memberId === memberId);

    // Fallback: if linkage missing (race during init) try matching by email or participant name
    if (!list.length) {
      try {
        const gymState = useGymStore.getState();
        const member = gymState.members?.find((m: any) => m.id === memberId);
        if (member) {
          const emailLower = member.email?.toLowerCase();
          if (emailLower) {
            list = get().signedWaivers.filter(
              (w) =>
                w.email?.toLowerCase() === emailLower || w.memberId === memberId
            );
          }
          // If still none, fallback to name match
          if (!list.length) {
            list = get().signedWaivers.filter(
              (w) => w.participantName === member.name
            );
          }
          // De-dupe just in case
          if (list.length) {
            const seen = new Set<string>();
            list = list.filter((w) =>
              seen.has(w.id) ? false : (seen.add(w.id), true)
            );
          }
        }
      } catch {}
    }

    list = list.sort(
      (a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime()
    );

    if (!list.length) return { label: "None", state: "none" };
    const latest = list[0];
    const evald = evaluateWaiverState(latest);
    switch (evald.state) {
      case "expired":
        return { label: "Expired", state: "expired", waiver: latest };
      case "expiringSoon":
        return {
          label: `Expires in ${(evald as any).daysLeft}d`,
          state: "expiringSoon",
          waiver: latest,
        };
      case "active":
        return { label: "Active", state: "active", waiver: latest };
      default:
        return { label: "None", state: "none" };
    }
  },
  init: async () => {
    await get().refresh();
    set({ loading: false });
  },
  refresh: async () => {
    await initGymDB();
    let [tpls, waivsRaw] = await Promise.all([
      getAll<WaiverTemplate>(STORE.waiverTemplates as any),
      getAll<any>(STORE.waivers),
    ]);

    // Reseed if either templates OR waivers are empty (e.g., after a manual reset) regardless of flag.
    if (
      (tpls.length === 0 || waivsRaw.length === 0) &&
      typeof window !== "undefined"
    ) {
      const seededBefore = localStorage.getItem(WAIVER_SEED_FLAG_KEY);
      if (!seededBefore || tpls.length === 0 || waivsRaw.length === 0) {
        const signedSeeds = buildSignedWaiverSeeds();
        // Only write templates if none present
        if (tpls.length === 0) {
          await bulkPut(
            STORE.waiverTemplates as any,
            WAIVER_TEMPLATE_SEEDS as any
          );
        }
        if (waivsRaw.length === 0) {
          await bulkPut(STORE.waivers as any, signedSeeds as any);
        }
        localStorage.setItem(WAIVER_SEED_FLAG_KEY, "1");
        [tpls, waivsRaw] = await Promise.all([
          getAll<WaiverTemplate>(STORE.waiverTemplates as any),
          getAll<any>(STORE.waivers),
        ]);
      }
    }

    const sortedTemplates = tpls.sort((a, b) => a.name.localeCompare(b.name));
    // Normalize possible legacy records
    let waivs: SignedWaiverRecord[] = waivsRaw.map((w: any) => {
      const participantName = w.participantName || w.memberName || "Unknown";
      const email = w.email || w.memberEmail || "";
      const templateName = w.templateName || w.waiverType || "Waiver";
      const signedAt = w.signedAt || w.signedDate || new Date().toISOString();
      const expiresAt = w.expiresAt || w.expiryDate || null;
      return {
        id: w.id,
        templateId: w.templateId || w.waiverType || "unknown-template",
        templateName,
        participantName,
        email,
        phone: w.phone,
        signedAt,
        expiresAt,
        status: deriveStatus(expiresAt),
        minorCount: w.minorCount,
        archived: w.archived || false,
        memberId: w.memberId, // legacy may not have this
      } as SignedWaiverRecord;
    });

    // Optional demo backfill: if we're in demo mode and have few waivers relative to members, add seeds for missing members
    try {
      const gymStore = useGymStore.getState();
      if (gymStore.demoMode && gymStore.members?.length) {
        const linkedMembers = new Set(
          waivs.map((w) => w.memberId).filter(Boolean) as string[]
        );
        // If less than 25% of members have waivers, backfill
        const coverage = linkedMembers.size / gymStore.members.length;
        if (coverage < 0.25) {
          const seedCandidates = buildSignedWaiverSeeds();
          // Filter out seeds for members already linked
          const newSeeds = seedCandidates.filter(
            (s) => s.memberId && !linkedMembers.has(s.memberId)
          );
          if (newSeeds.length) {
            await bulkPut(STORE.waivers as any, newSeeds as any);
            waivs = [...waivs, ...newSeeds];
          }
        }
      }
    } catch (err) {
      console.warn("Demo waiver backfill skipped", err);
    }

    // Backfill memberId for waivers missing linkage by matching email -> member
    try {
      const gymStore = useGymStore.getState();
      if (gymStore.members && gymStore.members.length) {
        const emailMap: Record<string, string> = {};
        gymStore.members.forEach(
          (m: any) => (emailMap[m.email.toLowerCase()] = m.id)
        );
        const toUpdate: SignedWaiverRecord[] = [];
        waivs.forEach((w) => {
          if (!w.memberId && w.email) {
            const mId = emailMap[w.email.toLowerCase()];
            if (mId) {
              w.memberId = mId;
              toUpdate.push(w);
            }
          }
        });
        if (toUpdate.length) {
          await bulkPut(
            STORE.waivers as any,
            toUpdate.map((w) => ({ ...w })) as any
          );
        }
      }
    } catch (err) {
      console.warn("Waiver memberId backfill failed", err);
    }
    const activeSigned = waivs
      .filter((w) => !w.archived)
      .map((w) => ({ ...w, status: deriveStatus(w.expiresAt) }));
    const archivedSigned = waivs.filter((w) => w.archived);
    const total = activeSigned.length;
    const activeCount = activeSigned.filter(
      (w) => w.status === "active"
    ).length;
    const expired = activeSigned.filter((w) => w.status === "expired").length;
    const expiringSoon = activeSigned.filter((w) => {
      if (!w.expiresAt) return false;
      const expiryDate = new Date(w.expiresAt);
      const thirty = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirty && w.status === "active";
    }).length;
    set({
      templates: sortedTemplates,
      signedWaivers: activeSigned,
      archivedWaivers: archivedSigned,
      stats: { total, active: activeCount, expired, expiringSoon },
    });
  },
  createTemplate: async (partial) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString().split("T")[0];
    const tpl: WaiverTemplate = {
      id,
      name: partial.name,
      description: partial.description,
      fieldGroups: partial.fieldGroups || [],
      documents: partial.documents || [],
      fieldCount: (partial.fieldGroups || []).reduce(
        (acc, g) => acc + g.fields.length,
        0
      ),
      expirationMonths: partial.expirationMonths ?? null,
      active: partial.active ?? true,
      createdAt: now,
      lastUsed: null,
      allowMinors: partial.allowMinors,
      maxMinors: partial.maxMinors,
    };
    await putItem(STORE.waiverTemplates as any, tpl as any);
    set((state) => ({
      templates: [...state.templates, tpl].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }));
    return tpl;
  },
  updateTemplate: async (id, partial) => {
    const existing = await getById<WaiverTemplate>(
      STORE.waiverTemplates as any,
      id
    );
    if (!existing) return null;
    const updated: WaiverTemplate = {
      ...existing,
      ...partial,
      fieldCount: (partial.fieldGroups || existing.fieldGroups).reduce(
        (acc, g) => acc + g.fields.length,
        0
      ),
    };
    await putItem(STORE.waiverTemplates as any, updated as any);
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  },
  duplicateTemplate: async (id) => {
    const existing = await getById<WaiverTemplate>(
      STORE.waiverTemplates as any,
      id
    );
    if (!existing) return null;
    const clone: WaiverTemplate = {
      ...existing,
      id: crypto.randomUUID(),
      name: existing.name + " (Copy)",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
      active: false,
    };
    await putItem(STORE.waiverTemplates as any, clone as any);
    set((state) => ({
      templates: [...state.templates, clone].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }));
    return clone;
  },
  toggleTemplateActive: async (id) => {
    const existing = await getById<WaiverTemplate>(
      STORE.waiverTemplates as any,
      id
    );
    if (!existing) return null;
    const updated = { ...existing, active: !existing.active };
    await putItem(STORE.waiverTemplates as any, updated as any);
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  },
  deleteTemplate: async (id) => {
    await deleteItem(STORE.waiverTemplates as any, id);
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    }));
  },
  getTemplate: (id) => get().templates.find((t) => t.id === id),
  signWaiver: async ({
    templateId,
    participantName,
    email,
    phone,
    minorCount,
  }) => {
    const { templates } = get();
    const template = templates.find((t) => t.id === templateId && t.active);
    if (!template) return null;
    const id = crypto.randomUUID();
    const signedAt = new Date().toISOString();
    const expiresAt = computeExpiresAt(template);
    // Attempt to link to existing member
    let memberId: string | undefined;
    try {
      const gymStore = useGymStore.getState();
      const existing = gymStore.members.find(
        (m: any) => m.email.toLowerCase() === (email || "").toLowerCase()
      );
      memberId = existing?.id;
    } catch {}
    const record: SignedWaiverRecord = {
      id,
      templateId,
      templateName: template.name,
      participantName,
      email,
      phone,
      signedAt,
      expiresAt,
      status: deriveStatus(expiresAt),
      minorCount,
      archived: false,
      memberId,
    };
    await putItem(STORE.waivers as any, record as any);
    // Optionally create a member record if enabled and one doesn't already exist
    try {
      const gymStore = useGymStore.getState();
      if (gymStore.autoCreateMemberOnWaiver) {
        const existing = gymStore.members.find(
          (m) =>
            m.email.toLowerCase() === email.toLowerCase() ||
            m.name === participantName
        );
        if (!existing) {
          await gymStore.addMember({
            name: participantName,
            email: email || `${id}@example.com`,
            phone: phone || "",
            membershipType: "Standard",
            status: "active",
            emergencyContact: "",
            medicalNotes: "",
          } as any);
          // Re-link memberId after auto-create
          try {
            const created = gymStore.members.find(
              (m: any) => m.email.toLowerCase() === email.toLowerCase()
            );
            if (created && !memberId) {
              memberId = created.id;
              await putItem(
                STORE.waivers as any,
                { ...record, memberId } as any
              );
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Auto-create member on waiver failed", err);
    }
    // update lastUsed on template
    const updatedTemplate: WaiverTemplate = {
      ...template,
      lastUsed: signedAt.split("T")[0],
    };
    await putItem(STORE.waiverTemplates as any, updatedTemplate as any);
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? updatedTemplate : t
      ),
      signedWaivers: [...state.signedWaivers, record],
    }));
    // Refresh stats
    await get().refresh();
    return record;
  },
  archiveWaiver: async (id) => {
    const existing = await getById<SignedWaiverRecord>(STORE.waivers, id);
    if (!existing) return null;
    const updated = { ...existing, archived: true };
    await putItem(STORE.waivers as any, updated as any);
    set((state) => ({
      signedWaivers: state.signedWaivers.filter((w) => w.id !== id),
      archivedWaivers: [...state.archivedWaivers, updated],
    }));
    // Refresh stats
    await get().refresh();
    return updated;
  },
  unarchiveWaiver: async (id) => {
    const existing = await getById<SignedWaiverRecord>(STORE.waivers, id);
    if (!existing) return null;
    const updated = { ...existing, archived: false };
    await putItem(STORE.waivers as any, updated as any);
    set((state) => ({
      signedWaivers: [...state.signedWaivers, updated],
      archivedWaivers: state.archivedWaivers.filter((w) => w.id !== id),
    }));
    // Refresh stats
    await get().refresh();
    return updated;
  },
  deleteWaiver: async (id) => {
    await deleteItem(STORE.waivers as any, id);
    set((state) => ({
      signedWaivers: state.signedWaivers.filter((w) => w.id !== id),
      archivedWaivers: state.archivedWaivers.filter((w) => w.id !== id),
    }));
    // Refresh stats
    await get().refresh();
  },
  resetWaivers: async () => {
    await initGymDB();
    await clearStore(STORE.waivers as any);
    await clearStore(STORE.waiverTemplates as any);
    set({
      templates: [],
      signedWaivers: [],
      archivedWaivers: [],
      stats: { total: 0, active: 0, expired: 0, expiringSoon: 0 },
    });
  },
  resetWaiversToSeed: async () => {
    await initGymDB();
    await clearStore(STORE.waivers as any);
    await clearStore(STORE.waiverTemplates as any);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(WAIVER_SEED_FLAG_KEY);
      }
    } catch {}
    const signedSeeds = buildSignedWaiverSeeds();
    await bulkPut(STORE.waiverTemplates as any, WAIVER_TEMPLATE_SEEDS as any);
    await bulkPut(STORE.waivers as any, signedSeeds as any);
    // Refresh state
    await get().refresh();
  },
}));

// Backward compatibility alias: some components call `useWaivers()` instead of `useWaiverStore()`.
// Zustand store functions are callable hooks, so aliasing is safe.
// Example usages that now work:
//   const { signedWaivers } = useWaivers();
//   const stats = useWaivers(s => s.stats);
export const useWaivers = useWaiverStore;
