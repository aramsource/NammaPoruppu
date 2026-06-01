import { RepresentativeRole } from "@/lib/domain";

export const ROLE_LABEL: Record<RepresentativeRole, string> = {
  Councillor: "Ward Councillor",
  MLA: "MLA",
  MP: "Member of Parliament",
  ZonalOfficer: "Zonal Officer",
  WardEngineer: "Ward Engineer",
  SanitaryInspector: "Sanitary Inspector",
};

export const ROLE_ICON: Record<RepresentativeRole, string> = {
  Councillor: "🏛",
  MLA: "🗳",
  MP: "🏟",
  ZonalOfficer: "🏢",
  WardEngineer: "⚙️",
  SanitaryInspector: "🧹",
};

export const ROLE_ORDER: RepresentativeRole[] = [
  "Councillor",
  "MLA",
  "MP",
  "ZonalOfficer",
  "WardEngineer",
  "SanitaryInspector",
];

export function isElectedRole(role: RepresentativeRole): boolean {
  return role === "Councillor" || role === "MLA" || role === "MP";
}
