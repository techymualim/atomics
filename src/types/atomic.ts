/** Domain model for an Atomic (a single trigger -> response swap). */
export interface Atomic {
  id: string;
  code: string;
  name: string;
  trigger: string;
  oldBehavior: string;
  newBehavior: string;
  note: string;
  graduated: boolean;
  graduatedAt: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

/** Shape of the raw `atomics` row coming back from Supabase. */
export interface AtomicRow {
  id: string;
  user_id: string;
  code: string;
  name: string;
  trigger: string;
  old_behavior: string;
  new_behavior: string;
  note: string | null;
  graduated: boolean;
  graduated_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface NewAtomicInput {
  name: string;
  trigger: string;
  oldBehavior: string;
  newBehavior: string;
}
