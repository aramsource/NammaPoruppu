import { IssueCategory } from "@/lib/domain";

export type CivicContact = {
  id: string;
  name: string;
  shortName: string;
  helpline: string;
  whatsapp?: string;   // full number with country code, e.g. "919444000512"
  email?: string;
  website?: string;
  description: string;
};

export const CIVIC_CONTACTS: Record<string, CivicContact> = {
  gcc: {
    id: "gcc",
    name: "Greater Chennai Corporation",
    shortName: "GCC",
    helpline: "1913",
    email: "commr.gcc@gmail.com",
    website: "https://www.chennaicorporation.gov.in",
    description: "Roads, garbage, drainage, footpaths, encroachment",
  },
  cmwssb: {
    id: "cmwssb",
    name: "Chennai Metro Water (CMWSSB)",
    shortName: "CMWSSB",
    helpline: "45674567",
    whatsapp: "919444000512",
    website: "https://www.chennaimetrowater.tn.gov.in",
    description: "Water supply, sewage, drainage leaks",
  },
  tangedco: {
    id: "tangedco",
    name: "TANGEDCO",
    shortName: "TANGEDCO",
    helpline: "1912",
    website: "https://www.tangedco.gov.in",
    description: "Streetlight issues, power outages",
  },
  cm_helpline: {
    id: "cm_helpline",
    name: "Tamil Nadu CM Helpline",
    shortName: "CM Helpline",
    helpline: "1100",
    description: "Escalation helpline for unresolved civic issues",
  },
};

// Maps each issue category to the most relevant department
const CATEGORY_CONTACT_MAP: Record<IssueCategory, string> = {
  Pothole:           "gcc",
  Garbage:           "gcc",
  "Broken Footpath": "gcc",
  "Dust Pollution":  "gcc",
  Encroachment:      "gcc",
  Waterlogging:      "cmwssb",
  "Sewage Leak":     "cmwssb",
  Drainage:          "cmwssb",
  "Streetlight Issue": "tangedco",
  Other:             "gcc",
};

export function getContactForCategory(category: string): CivicContact {
  const key = CATEGORY_CONTACT_MAP[category as IssueCategory] ?? "gcc";
  return CIVIC_CONTACTS[key];
}
