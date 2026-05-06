import { EscalationStep, IssueResponsibility, RepresentativeRole } from "@/lib/domain";

export const responsibilityByCategory: IssueResponsibility[] = [
  {
    category: "Pothole",
    primaryRole: "WardEngineer",
    escalationOrder: ["WardEngineer", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Garbage",
    primaryRole: "SanitaryInspector",
    escalationOrder: ["SanitaryInspector", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Broken Footpath",
    primaryRole: "WardEngineer",
    escalationOrder: ["WardEngineer", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Dust Pollution",
    primaryRole: "SanitaryInspector",
    escalationOrder: ["SanitaryInspector", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Waterlogging",
    primaryRole: "WardEngineer",
    escalationOrder: ["WardEngineer", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Sewage Leak",
    primaryRole: "WardEngineer",
    escalationOrder: ["WardEngineer", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Streetlight Issue",
    primaryRole: "WardEngineer",
    escalationOrder: ["WardEngineer", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Encroachment",
    primaryRole: "Councillor",
    escalationOrder: ["Councillor", "ZonalOfficer", "MLA", "MP"],
  },
  {
    category: "Drainage",
    primaryRole: "WardEngineer",
    escalationOrder: ["WardEngineer", "ZonalOfficer", "Councillor", "MLA", "MP"],
  },
  {
    category: "Other",
    primaryRole: "Councillor",
    escalationOrder: ["Councillor", "ZonalOfficer", "MLA", "MP"],
  },
];

export const escalationSteps: Record<RepresentativeRole, EscalationStep> = {
  Councillor: {
    role: "Councillor",
    stepTitle: "Ward-level elected representative",
    responseTargetHours: 24,
  },
  WardEngineer: {
    role: "WardEngineer",
    stepTitle: "Ward engineering operations",
    responseTargetHours: 24,
  },
  SanitaryInspector: {
    role: "SanitaryInspector",
    stepTitle: "Sanitation field operations",
    responseTargetHours: 12,
  },
  ZonalOfficer: {
    role: "ZonalOfficer",
    stepTitle: "Zone-level escalation authority",
    responseTargetHours: 48,
  },
  MLA: {
    role: "MLA",
    stepTitle: "Assembly constituency escalation",
    responseTargetHours: 72,
  },
  MP: {
    role: "MP",
    stepTitle: "Parliamentary constituency escalation",
    responseTargetHours: 96,
  },
};
