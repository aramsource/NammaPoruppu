export const issueCategories = [
  "Pothole",
  "Garbage",
  "Broken Footpath",
  "Dust Pollution",
  "Waterlogging",
  "Sewage Leak",
  "Streetlight Issue",
  "Encroachment",
  "Drainage",
  "Other",
] as const;

export type IssueCategory = (typeof issueCategories)[number];

export type ReportStatus = "open" | "pending_verification" | "resolved" | "withdrawn";
export type RepresentativeRole =
  | "Councillor"
  | "MLA"
  | "MP"
  | "ZonalOfficer"
  | "WardEngineer"
  | "SanitaryInspector";

export type GovernanceMapping = {
  wardId: string;
  wardName: string;
  wardNumber: number;
  zoneName: string;
  city: string;
  assemblyConstituency: string;
};

export type Report = {
  id: string;
  userId: string;
  category: IssueCategory;
  description: string | null;
  lat: number;
  lng: number;
  address: string;
  status: ReportStatus;
  supportCount: number;
  createdAt: string;
  governance: GovernanceMapping;
  imageUrls: string[];
  reporterUserId?: string | null;
  reporterSessionId?: string | null;
};

export type Ward = {
  id: string;
  wardNumber: number;
  wardName: string;
  zoneName: string;
  city: string;
  assemblyConstituency: string;
  boundary: [number, number][];
};

export type Representative = {
  id: string;
  name: string;
  role: RepresentativeRole;
  wardId: string;
  area: string;
  constituency?: string;
  party?: string;
  partyColor?: string;
  photoUrl?: string;
  email: string;
  helpline: string;
  officeHours: string;
  preferredChannel: "email" | "phone";
};

export type IssueResponsibility = {
  category: IssueCategory;
  primaryRole: RepresentativeRole;
  escalationOrder: RepresentativeRole[];
};

export type EscalationStep = {
  role: RepresentativeRole;
  stepTitle: string;
  responseTargetHours: number;
};

export type ReportLocation = {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  displayAddress: string;
  street: string | null;
  neighbourhood: string | null;
  city: string | null;
  postcode: string | null;
};

export type ReportCreateInput = {
  cityId: string;
  wardId: string;
  category: IssueCategory;
  description: string | null;
  location: ReportLocation;
  imageUrls: string[];
  reporterSessionId: string;
};

export type ResolveProofInput = {
  reportId: string;
  proofImageUrl: string;
  note: string | null;
  location: Pick<ReportLocation, "lat" | "lng" | "accuracyMeters">;
  verifierSessionId: string;
};
