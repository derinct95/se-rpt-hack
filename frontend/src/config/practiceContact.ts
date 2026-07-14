import type { PracticeType } from "../types";

export interface PracticeContact {
  phone: string;
  address: string;
}

export const VERTICAL_CONTACT: Record<PracticeType, PracticeContact> = {
  medical: { phone: "(555) 014-2200", address: "100 Riverside Plaza, Suite 400, Springfield, ST 62704" },
  dental: { phone: "(555) 014-2210", address: "200 Family Dental Way, Springfield, ST 62704" },
};
