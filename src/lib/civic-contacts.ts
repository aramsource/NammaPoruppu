import { IssueCategory } from "@/lib/domain";
import { DEFAULT_CITY } from "@/lib/cities";

export type CivicContact = {
  id: string;
  name: string;
  shortName: string;
  helpline: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  description: string;
};

const SHARED: Record<string, CivicContact> = {
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

const CITY_CONTACTS: Record<string, Record<string, CivicContact>> = {
  chennai: {
    corp: {
      id: "corp",
      name: "Greater Chennai Corporation",
      shortName: "GCC",
      helpline: "1913",
      whatsapp: "919445061913",
      email: "commr.gcc@gmail.com",
      website: "https://www.chennaicorporation.gov.in",
      description: "Roads, garbage, drainage, footpaths, encroachment",
    },
    water: {
      id: "water",
      name: "Chennai Metro Water (CMWSSB)",
      shortName: "CMWSSB",
      helpline: "45674567",
      whatsapp: "919444000512",
      website: "https://www.chennaimetrowater.tn.gov.in",
      description: "Water supply, sewage, drainage leaks",
    },
    ...SHARED,
  },
  coimbatore: {
    corp: {
      id: "corp",
      name: "Coimbatore City Municipal Corporation",
      shortName: "CCMC",
      helpline: "0422-2390261",
      website: "https://coimbatorecorp.tn.gov.in",
      description: "Roads, garbage, drainage, footpaths, encroachment",
    },
    water: {
      id: "water",
      name: "Coimbatore City Municipal Corporation (Water & Sewage)",
      shortName: "CCMC Water",
      helpline: "0422-2390261",
      website: "https://coimbatorecorp.tn.gov.in",
      description: "Water supply, sewage, drainage leaks",
    },
    ...SHARED,
  },
  madurai: {
    corp: {
      id: "corp",
      name: "Madurai City Municipal Corporation",
      shortName: "MCMC",
      helpline: "0452-2531401",
      website: "https://maduraicorporation.co.in",
      description: "Roads, garbage, drainage, footpaths, encroachment",
    },
    water: {
      id: "water",
      name: "Madurai City Municipal Corporation (Water & Sewage)",
      shortName: "MCMC Water",
      helpline: "0452-2531401",
      website: "https://maduraicorporation.co.in",
      description: "Water supply, sewage, drainage leaks",
    },
    ...SHARED,
  },
};

/** @deprecated Use getContactsForCity */
export const CIVIC_CONTACTS = CITY_CONTACTS.chennai;

const CATEGORY_CONTACT_MAP: Record<IssueCategory, "corp" | "water" | "tangedco"> = {
  Pothole: "corp",
  Garbage: "corp",
  "Broken Footpath": "corp",
  "Dust Pollution": "corp",
  Encroachment: "corp",
  Waterlogging: "water",
  "Sewage Leak": "water",
  Drainage: "water",
  "Streetlight Issue": "tangedco",
  Other: "corp",
};

export function getContactsForCity(cityId: string = DEFAULT_CITY.id) {
  return CITY_CONTACTS[cityId] ?? CITY_CONTACTS.chennai;
}

export function getContactForCategory(category: string, cityId: string = DEFAULT_CITY.id): CivicContact {
  const contacts = getContactsForCity(cityId);
  const key = CATEGORY_CONTACT_MAP[category as IssueCategory] ?? "corp";
  return contacts[key] ?? contacts.corp;
}

/** Opens WhatsApp to a specific number with pre-filled text (not share picker). */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return `https://wa.me/?text=${encodeURIComponent(text)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
