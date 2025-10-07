"use client";

import { create } from "zustand";
import {
  Member,
  ClassItem,
  EquipmentItem,
  IncidentItem,
  WaiverItem,
  StaffMemberItem,
  PaymentItem,
  MembershipPlan,
  DemoLimits,
  OperationResult,
} from "@/types/gym-management";
import {
  initGymDB,
  getAll,
  putItem,
  deleteItem,
  getOrInitMeta,
  updateMeta,
  STORE,
  clearAllData,
  bulkPut,
} from "@/contexts/gym/gym-db";
import { ALL_SEEDS } from "@/contexts/gym/gym-seed";

// Demo limits (default)
const DEMO_LIMITS: DemoLimits = {
  classes: 1,
  members: 3,
  equipment: 3,
  incidents: 5,
  waivers: 5,
  staff: 3,
  payments: 10,
  membershipPlans: 3,
};

// Reusable age computation (years) from an ISO birth date string
function computeAge(birthDate: string): number | undefined {
  try {
    const today = new Date();
    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) return undefined;
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  } catch {
    return undefined;
  }
}

interface GymStore {
  loading: boolean;
  demoMode: boolean;
  allowOverEnrollment: boolean;
  autoCreateMemberOnWaiver: boolean;
  limits: DemoLimits;
  // Collections (filtered to exclude archived for staff & waivers by default)
  members: Member[];
  classes: ClassItem[];
  equipment: EquipmentItem[];
  incidents: IncidentItem[];
  waivers: WaiverItem[]; // active (non-archived) only
  staff: StaffMemberItem[]; // active (non-archived) only
  staffAll: StaffMemberItem[]; // full list including archived
  payments: PaymentItem[];
  membershipPlans: MembershipPlan[];
  // Actions
  init: () => Promise<void>;
  toggleDemoMode: () => Promise<void>;
  toggleAllowOverEnrollment: () => Promise<void>;
  toggleAutoCreateMemberOnWaiver: () => Promise<void>;
  // CRUD helpers (auto-enforce limits in demo mode)
  addMember: (
    m: Omit<Member, "id" | "joinDate" | "lastVisit">
  ) => Promise<OperationResult<Member>>;
  addClass: (c: Omit<ClassItem, "id">) => Promise<OperationResult<ClassItem>>;
  addEquipment: (
    e: Omit<EquipmentItem, "id">
  ) => Promise<OperationResult<EquipmentItem>>;
  addIncident: (
    i: Omit<IncidentItem, "id" | "status">
  ) => Promise<OperationResult<IncidentItem>>;
  addWaiver: (
    w: Omit<WaiverItem, "id" | "status">
  ) => Promise<OperationResult<WaiverItem>>;
  addStaff: (
    s: Omit<StaffMemberItem, "id" | "classes">
  ) => Promise<OperationResult<StaffMemberItem>>;
  addPayment: (
    p: Omit<PaymentItem, "id">
  ) => Promise<OperationResult<PaymentItem>>;
  addMembershipPlan: (
    p: Omit<MembershipPlan, "id" | "createdAt" | "updatedAt">
  ) => Promise<OperationResult<MembershipPlan>>;
  updateMember: (
    id: string,
    partial: Partial<Member>
  ) => Promise<OperationResult<Member>>;
  updateClass: (
    id: string,
    partial: Partial<ClassItem>
  ) => Promise<OperationResult<ClassItem>>;
  updateEquipment: (
    id: string,
    partial: Partial<EquipmentItem>
  ) => Promise<OperationResult<EquipmentItem>>;
  updateIncident: (
    id: string,
    partial: Partial<IncidentItem>
  ) => Promise<OperationResult<IncidentItem>>;
  updateWaiver: (
    id: string,
    partial: Partial<WaiverItem>
  ) => Promise<OperationResult<WaiverItem>>;
  updateStaff: (
    id: string,
    partial: Partial<StaffMemberItem>
  ) => Promise<OperationResult<StaffMemberItem>>;
  updatePayment: (
    id: string,
    partial: Partial<PaymentItem>
  ) => Promise<OperationResult<PaymentItem>>;
  updateMembershipPlan: (
    id: string,
    partial: Partial<MembershipPlan>
  ) => Promise<OperationResult<MembershipPlan>>;
  removeMember: (id: string) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  removeEquipment: (id: string) => Promise<void>;
  removeIncident: (id: string) => Promise<void>;
  removeWaiver: (id: string) => Promise<void>; // archives instead of hard delete
  removeStaff: (id: string) => Promise<void>; // archives instead of hard delete
  removePayment: (id: string) => Promise<void>;
  removeMembershipPlan: (id: string) => Promise<void>;
  // Archive controls
  archiveStaff: (id: string) => Promise<OperationResult<StaffMemberItem>>;
  archiveWaiver: (id: string) => Promise<OperationResult<WaiverItem>>;
  unarchiveStaff: (id: string) => Promise<OperationResult<StaffMemberItem>>;
  unarchiveWaiver: (id: string) => Promise<OperationResult<WaiverItem>>;
  // Hard reset (purge) everything except meta/demo flag
  purgeAllGymData: () => Promise<void>;
  // Reset DB contents to the bundled seed/demo data (for debugging)
  resetToSeed: () => Promise<void>;
}

export const useGymStore = create<GymStore>()((set, get) => ({
  loading: true,
  demoMode: false,
  allowOverEnrollment: false,
  autoCreateMemberOnWaiver: false,
  limits: DEMO_LIMITS,
  members: [],
  classes: [],
  equipment: [],
  incidents: [],
  waivers: [],
  staff: [],
  staffAll: [],
  payments: [],
  membershipPlans: [],
  init: async () => {
    try {
      await initGymDB();
      const meta = await getOrInitMeta();
      set({
        demoMode: meta.demoMode,
        allowOverEnrollment: meta.allowOverEnrollment,
        autoCreateMemberOnWaiver: !!meta.autoCreateMemberOnWaiver,
      });
      const [m, c, e, i, w, s, p, mp] = await Promise.all([
        getAll<Member>(STORE.members),
        getAll<ClassItem>(STORE.classes),
        getAll<EquipmentItem>(STORE.equipment),
        getAll<IncidentItem>(STORE.incidents),
        getAll<WaiverItem>(STORE.waivers),
        getAll<StaffMemberItem>(STORE.staff),
        getAll<PaymentItem>(STORE.payments),
        getAll<MembershipPlan>(STORE.membershipPlans),
      ]);
      // Enrich with computed age if birthDate present
      const enrichedMembers = m.map((mem: any) =>
        mem.birthDate && typeof mem.ageYears === "undefined"
          ? { ...mem, ageYears: computeAge(mem.birthDate) }
          : mem
      );
      set({
        members: enrichedMembers,
        classes: c,
        equipment: e,
        incidents: i,
        waivers: w.filter((w) => !w.archived),
        staff: s.filter((s) => !s.archived),
        staffAll: s,
        payments: p,
      });
      if (mp.length === 0) {
        // Derive initial membership plans from distinct membershipType values in members
        const distinct = Array.from(
          new Set(
            m
              .map((mem: any) => mem.membershipType)
              .filter((v: any) => typeof v === "string" && v.trim().length)
          )
        );
        // Provide heuristic/default pricing
        const priceMap: Record<string, number> = {
          "Premium Gymnastics": 89,
          "Basic Gymnastics": 59,
          "Parkour Basic": 65,
          "Parkour Advanced": 85,
          "Youth Tumbling": 55,
          "Adult Fitness": 70,
          "Open Gym": 45,
        };
        const generated: MembershipPlan[] = distinct.map((name) => ({
          id: crypto.randomUUID(),
          name,
          price: priceMap[name] ?? 50,
          billingInterval: "monthly",
          description: `Auto-generated plan for ${name}`,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        if (generated.length) {
          await bulkPut(STORE.membershipPlans, generated);
          set({ membershipPlans: generated });
        } else {
          set({ membershipPlans: mp });
        }
      } else {
        set({ membershipPlans: mp });
      }
    } finally {
      set({ loading: false });
    }
  },
  toggleDemoMode: async () => {
    const { demoMode } = get();
    const updated = await updateMeta({ demoMode: !demoMode });
    set({ demoMode: updated.demoMode });
  },
  toggleAllowOverEnrollment: async () => {
    const { allowOverEnrollment } = get();
    const updated = await updateMeta({
      allowOverEnrollment: !allowOverEnrollment,
    });
    set({ allowOverEnrollment: updated.allowOverEnrollment });
  },
  toggleAutoCreateMemberOnWaiver: async () => {
    const { autoCreateMemberOnWaiver } = get();
    const updated = await updateMeta({
      autoCreateMemberOnWaiver: !autoCreateMemberOnWaiver,
    });
    set({ autoCreateMemberOnWaiver: !!updated.autoCreateMemberOnWaiver });
  },
  addMember: async (partial) => {
    const { demoMode, members } = get();
    const limit = DEMO_LIMITS.members;
    if (demoMode && members.length >= limit) {
      return {
        success: false,
        error: `Demo limit reached: members limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: Member = {
      id: crypto.randomUUID(),
      joinDate: new Date().toISOString().split("T")[0],
      lastVisit: "Never",
      ...(partial.birthDate
        ? {
            ageYears: computeAge(partial.birthDate),
          }
        : {}),
      ...partial,
    };
    await putItem(STORE.members, item);
    set((state) => ({ members: [...state.members, item] }));
    return { success: true, item };
  },
  addClass: async (partial) => {
    const { demoMode, classes } = get();
    const limit = DEMO_LIMITS.classes;
    if (demoMode && classes.length >= limit) {
      return {
        success: false,
        error: `Demo limit reached: classes limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: ClassItem = {
      id: crypto.randomUUID(),
      students: [],
      ...partial,
      enrolled: partial.enrolled ?? 0,
      instructors: partial.instructors ?? [],
    };
    await putItem(STORE.classes, item);
    set((state) => ({ classes: [...state.classes, item] }));
    return { success: true, item };
  },
  addEquipment: async (partial) => {
    const { demoMode, equipment } = get();
    const limit = DEMO_LIMITS.equipment;
    if (demoMode && equipment.length >= limit) {
      return {
        success: false,
        error: `Demo limit reached: equipment items limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: EquipmentItem = {
      id: crypto.randomUUID(),
      ...partial,
    };
    await putItem(STORE.equipment, item);
    set((state) => ({ equipment: [...state.equipment, item] }));
    return { success: true, item };
  },
  addIncident: async (partial) => {
    const { demoMode, incidents } = get();
    const limit = DEMO_LIMITS.incidents;
    if (demoMode && incidents.length >= limit) {
      return {
        success: false,
        error: `Demo limit reached: incident reports limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: IncidentItem = {
      id: crypto.randomUUID(),
      status: "reported",
      ...partial,
    };
    await putItem(STORE.incidents, item);
    set((state) => ({ incidents: [...state.incidents, item] }));
    return { success: true, item };
  },
  addWaiver: async (partial) => {
    const { demoMode, waivers } = get();
    const limit = DEMO_LIMITS.waivers;
    const effectiveLength = waivers.length; // Since waivers are already filtered
    if (demoMode && effectiveLength >= limit) {
      return {
        success: false,
        error: `Demo limit reached: waivers limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: WaiverItem = {
      id: crypto.randomUUID(),
      status: "pending",
      archived: false,
      ...partial,
    };
    await putItem(STORE.waivers, item);
    set((state) => ({
      waivers: item.archived ? state.waivers : [...state.waivers, item],
    }));
    return { success: true, item };
  },
  addStaff: async (partial) => {
    const { demoMode, staff } = get();
    const limit = DEMO_LIMITS.staff;
    const effectiveLength = staff.length; // Filtered active
    if (demoMode && effectiveLength >= limit) {
      return {
        success: false,
        error: `Demo limit reached: staff members limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: StaffMemberItem = {
      id: crypto.randomUUID(),
      classes: 0,
      archived: false,
      ...partial,
    };
    await putItem(STORE.staff, item);
    set((state) => ({
      staff: item.archived ? state.staff : [...state.staff, item],
      staffAll: [...state.staffAll, item],
    }));
    return { success: true, item };
  },
  addPayment: async (partial) => {
    const { demoMode, payments } = get();
    const limit = DEMO_LIMITS.payments;
    if (demoMode && payments.length >= limit) {
      return {
        success: false,
        error: `Demo limit reached: payments limit is ${limit}. Upgrade to add more.`,
      };
    }
    const item: PaymentItem = {
      id: crypto.randomUUID(),
      ...partial,
    };
    await putItem(STORE.payments, item);
    set((state) => ({ payments: [...state.payments, item] }));
    return { success: true, item };
  },
  addMembershipPlan: async (partial) => {
    const { demoMode, membershipPlans } = get();
    const limit = DEMO_LIMITS.membershipPlans;
    if (demoMode && membershipPlans.length >= limit) {
      return {
        success: false,
        error: `Demo limit reached: membership plans limit is ${limit}. Upgrade to add more.`,
      };
    }
    const nowIso = new Date().toISOString();
    const item: MembershipPlan = {
      id: crypto.randomUUID(),
      ...partial,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: (partial as any)?.status ?? "active",
    } as MembershipPlan;
    await putItem(STORE.membershipPlans, item);
    set((state) => ({ membershipPlans: [...state.membershipPlans, item] }));
    return { success: true, item };
  },
  updateMember: async (id, partial) => {
    const { members } = get();
    const existing = members.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Member not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.members, updated);
    set((state) => ({
      members: state.members.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updateClass: async (id, partial) => {
    const { classes } = get();
    const existing = classes.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Class not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.classes, updated);
    set((state) => ({
      classes: state.classes.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updateEquipment: async (id, partial) => {
    const { equipment } = get();
    const existing = equipment.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Equipment not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.equipment, updated);
    set((state) => ({
      equipment: state.equipment.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updateIncident: async (id, partial) => {
    const { incidents } = get();
    const existing = incidents.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Incident not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.incidents, updated);
    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updateWaiver: async (id, partial) => {
    const { waivers } = get();
    const existing = waivers.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Waiver not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.waivers, updated);
    set((state) => ({
      waivers: state.waivers.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updateStaff: async (id, partial) => {
    const { staff, staffAll } = get();
    const existing = staffAll.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Staff member not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.staff, updated);
    set((state) => ({
      staff: state.staff.map((i) => (i.id === id ? updated : i)),
      staffAll: state.staffAll.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updatePayment: async (id, partial) => {
    const { payments } = get();
    const existing = payments.find((i) => i.id === id);
    if (!existing) return { success: false, error: "Payment not found" };
    const updated = { ...existing, ...partial };
    await putItem(STORE.payments, updated);
    set((state) => ({
      payments: state.payments.map((i) => (i.id === id ? updated : i)),
    }));
    return { success: true, item: updated };
  },
  updateMembershipPlan: async (id, partial) => {
    // Fetch plans & members so we can propagate a name change to all members referencing it
    const { membershipPlans, members } = get();
    const existing = membershipPlans.find((i) => i.id === id);
    if (!existing)
      return { success: false, error: "Membership Plan not found" };
    const nameChanged =
      typeof partial.name === "string" && partial.name !== existing.name;
    const updated = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await putItem(STORE.membershipPlans, updated);

    let updatedMembers = members;
    // If the plan name changed, update all members whose membershipType matches the old name.
    if (nameChanged) {
      const oldName = existing.name;
      const newName = partial.name as string;
      const changedMembers: typeof members = [];
      updatedMembers = members.map((m) => {
        if (m.membershipType === oldName) {
          const nm = { ...m, membershipType: newName };
          changedMembers.push(nm);
          return nm;
        }
        return m;
      });
      // Persist only changed members back to IndexedDB
      // (Avoid rewriting all members if not needed.)
      for (const cm of changedMembers) {
        await putItem(STORE.members, cm);
      }
    }

    set((state) => ({
      membershipPlans: state.membershipPlans.map((i) =>
        i.id === id ? updated : i
      ),
      members: nameChanged ? updatedMembers : state.members,
    }));
    return { success: true, item: updated };
  },
  removeMember: async (id) => {
    await deleteItem(STORE.members, id);
    set((state) => ({ members: state.members.filter((i) => i.id !== id) }));
  },
  removeClass: async (id) => {
    await deleteItem(STORE.classes, id);
    set((state) => ({ classes: state.classes.filter((i) => i.id !== id) }));
  },
  removeEquipment: async (id) => {
    await deleteItem(STORE.equipment, id);
    set((state) => ({ equipment: state.equipment.filter((i) => i.id !== id) }));
  },
  removeIncident: async (id) => {
    await deleteItem(STORE.incidents, id);
    set((state) => ({ incidents: state.incidents.filter((i) => i.id !== id) }));
  },
  removeWaiver: async (id) => {
    await get().archiveWaiver(id);
  },
  removeStaff: async (id) => {
    await get().archiveStaff(id);
  },
  removePayment: async (id) => {
    await deleteItem(STORE.payments, id);
    set((state) => ({ payments: state.payments.filter((i) => i.id !== id) }));
  },
  removeMembershipPlan: async (id) => {
    await deleteItem(STORE.membershipPlans, id);
    set((state) => ({
      membershipPlans: state.membershipPlans.filter((i) => i.id !== id),
    }));
  },
  archiveWaiver: async (id) => {
    const { waivers } = get();
    const existing = waivers.find((w) => w.id === id);
    if (!existing) return { success: false, error: "Waiver not found" };
    if (existing.archived) return { success: true, item: existing };
    const updated = { ...existing, archived: true };
    await putItem(STORE.waivers, updated);
    set((state) => ({
      waivers: state.waivers.filter((w) => w.id !== id),
    }));
    return { success: true, item: updated };
  },
  unarchiveWaiver: async (id) => {
    const { waivers } = get();
    const existing = waivers.find((w) => w.id === id);
    if (!existing) return { success: false, error: "Waiver not found" };
    if (!existing.archived) return { success: true, item: existing };
    const updated = { ...existing, archived: false };
    await putItem(STORE.waivers, updated);
    set((state) => ({ waivers: [...state.waivers, updated] }));
    return { success: true, item: updated };
  },
  archiveStaff: async (id) => {
    const { staff, staffAll } = get();
    const existing = staffAll.find((s) => s.id === id);
    if (!existing) return { success: false, error: "Staff not found" };
    if (existing.archived) return { success: true, item: existing };
    const updated = { ...existing, archived: true };
    await putItem(STORE.staff, updated);
    set((state) => ({
      staff: state.staff.filter((s) => s.id !== id),
      staffAll: state.staffAll.map((s) => (s.id === id ? updated : s)),
    }));
    return { success: true, item: updated };
  },
  unarchiveStaff: async (id) => {
    const { staff, staffAll } = get();
    const existing = staffAll.find((s) => s.id === id);
    if (!existing) return { success: false, error: "Staff not found" };
    if (!existing.archived) return { success: true, item: existing };
    const updated = { ...existing, archived: false };
    await putItem(STORE.staff, updated);
    set((state) => ({
      staff: [...state.staff, updated],
      staffAll: state.staffAll.map((s) => (s.id === id ? updated : s)),
    }));
    return { success: true, item: updated };
  },
  purgeAllGymData: async () => {
    await clearAllData();
    set({
      members: [],
      classes: [],
      equipment: [],
      incidents: [],
      waivers: [],
      staff: [],
      staffAll: [],
      payments: [],
      membershipPlans: [],
    });
  },
  resetToSeed: async () => {
    set({ loading: true });
    // Clear all non-meta stores
    await clearAllData();
    // Bulk seed each store
    await Promise.all([
      bulkPut(STORE.members, ALL_SEEDS.members),
      bulkPut(STORE.classes, ALL_SEEDS.classes),
      bulkPut(STORE.equipment, ALL_SEEDS.equipment),
      bulkPut(STORE.incidents, ALL_SEEDS.incidents),
      bulkPut(STORE.waivers, ALL_SEEDS.waivers),
      bulkPut(STORE.staff, ALL_SEEDS.staff),
      bulkPut(STORE.payments, ALL_SEEDS.payments),
      bulkPut(STORE.membershipPlans, ALL_SEEDS.membershipPlans || []),
    ]);
    // Refresh in-memory state from DB
    const [mRaw, cRaw, eRaw, iRaw, wRaw, sRaw, pRaw, mpRaw] = await Promise.all(
      [
        getAll<any>(STORE.members),
        getAll<any>(STORE.classes),
        getAll<any>(STORE.equipment),
        getAll<any>(STORE.incidents),
        getAll<any>(STORE.waivers),
        getAll<any>(STORE.staff),
        getAll<any>(STORE.payments),
        getAll<any>(STORE.membershipPlans),
      ]
    );
    set({
      members: mRaw as Member[],
      classes: cRaw as ClassItem[],
      equipment: eRaw as EquipmentItem[],
      incidents: iRaw as IncidentItem[],
      waivers: wRaw.filter((w: WaiverItem) => !w.archived),
      staff: sRaw.filter((s: StaffMemberItem) => !s.archived),
      staffAll: sRaw as StaffMemberItem[],
      payments: pRaw as PaymentItem[],
      membershipPlans: mpRaw as MembershipPlan[],
      loading: false,
    });
  },
}));

// Backward compatibility: legacy components expect a `useGym` hook.
// The Zustand store hook returned by `create` is itself callable with optional
// selectors, so we can safely alias it. Example usages that will now work:
//   const { members } = useGym();
//   const members = useGym((s) => s.members);
export const useGym = useGymStore;

// In development, expose reset for console
// if (process.env.NODE_ENV !== "production") {
if (typeof window !== "undefined") {
  // @ts-expect-error TS2339: Property '__resetGymToSeed' does not exist on type 'Window & typeof globalThis'.
  window.__resetGymToSeed = async () => {
    await useGymStore.getState().resetToSeed();
    return true;
  };
}
// }
