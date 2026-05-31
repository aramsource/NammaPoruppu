export type IssueShareRepresentative = {
  name: string;
  role: string;
  area?: string;
};

export type IssueShareInput = {
  category: string;
  description: string | null;
  address: string;
  wardLabel: string;
  cityId?: string;
  cityName: string;
  reportUrl: string;
  representative: IssueShareRepresentative | null;
  supportCount?: number;
  imageUrls?: string[];
};

const MAX_SHARE_PHOTOS = 3;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeShareToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseWardLabel(wardLabel: string) {
  const trimmed = wardLabel.trim();
  const withSep = trimmed.match(/^ward\s+(\d+)\s*[·•.\-–—]\s*(.+)$/i);
  if (withSep) {
    const number = withSep[1];
    const name = withSep[2].trim();
    if (normalizeShareToken(name) === normalizeShareToken(`Ward ${number}`)) {
      return { number, name: undefined, raw: trimmed };
    }
    return { number, name, raw: trimmed };
  }
  const simple = trimmed.match(/^ward\s*#?(\d+)$/i);
  if (simple) {
    return { number: simple[1], name: undefined, raw: trimmed };
  }
  return { number: undefined, name: trimmed, raw: trimmed };
}

/** Avoid "Ward 112 · Ward 112" when DB ward_name is generic. */
export function formatWardLabel(
  wardNumber: number | null | undefined,
  wardName: string | null | undefined,
): string {
  const num =
    wardNumber != null && Number.isFinite(wardNumber) ? String(Math.trunc(wardNumber)) : null;
  const name = (wardName ?? "").trim();
  const wardShort = num ? `Ward ${num}` : "";

  if (!num && !name) return "";
  if (!num) return name;
  if (!name) return wardShort;

  const nameNorm = normalizeShareToken(name);
  const shortNorm = normalizeShareToken(wardShort);
  if (nameNorm === shortNorm || nameNorm === num || nameNorm === `ward${num}`) {
    return wardShort;
  }

  const leadingWard = name.match(/^ward\s*#?(\d+)\s*(?:[,·•.\-–—]\s*)?(.*)$/i);
  if (leadingWard && leadingWard[1] === num) {
    const rest = (leadingWard[2] ?? "").trim();
    if (!rest) return wardShort;
    const restNorm = normalizeShareToken(rest);
    if (restNorm === shortNorm) return wardShort;
    if (/^zone\s*\d*/i.test(rest)) {
      const afterZone = rest.replace(/^zone\s*\d*\s*/i, "").trim();
      if (afterZone && normalizeShareToken(afterZone) !== shortNorm) {
        return `${wardShort} · ${afterZone}`;
      }
      return wardShort;
    }
    return `${wardShort} · ${rest}`;
  }

  if (nameNorm.includes(shortNorm)) return wardShort;

  return `${wardShort} · ${name}`;
}

export function normalizeWardLabelString(wardLabel: string): string {
  const trimmed = wardLabel.trim();
  if (!trimmed) return "";
  const { number, name } = parseWardLabel(trimmed);
  if (!number) return trimmed;
  return formatWardLabel(Number(number), name ?? `Ward ${number}`);
}

/** Street-level location with ward / city prefixes removed when already in the headline. */
export function shareStreetAddress(wardLabel: string, cityName: string, address: string): string {
  let loc = address.trim();
  if (!loc) return "";

  const { number, name } = parseWardLabel(wardLabel);
  const cityPattern = escapeRegExp(cityName.trim());

  const stripPatterns: RegExp[] = [];
  if (number && name) {
    stripPatterns.push(
      new RegExp(`^ward\\s*#?${number}\\s*[,·•.\\-–—]?\\s*${escapeRegExp(name)}\\s*`, "i"),
      new RegExp(`^ward\\s*${number}\\s*[,·•.\\-–—]?\\s*${escapeRegExp(name)}\\s*`, "i"),
      new RegExp(`^${escapeRegExp(name)}\\s*[,·•.\\-–—]?\\s*ward\\s*#?${number}\\s*`, "i"),
    );
  }
  if (number) {
    stripPatterns.push(new RegExp(`^ward\\s*#?${number}\\s*[,·•.\\-–—]?\\s*`, "i"));
  }
  if (name) {
    stripPatterns.push(new RegExp(`^${escapeRegExp(name)}\\s*[,·•.\\-–—]?\\s*`, "i"));
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of stripPatterns) {
      const next = loc.replace(pattern, "");
      if (next !== loc) {
        loc = next;
        changed = true;
      }
    }
  }

  loc = loc.replace(new RegExp(`[,·•.\\-–—]?\\s*${cityPattern}\\s*$`, "i"), "");
  loc = loc.replace(/^[\s,·•.\-–—]+|[\s,·•.\-–—]+$/g, "").trim();

  const locNorm = normalizeShareToken(loc);
  const wardNorm = normalizeShareToken(wardLabel);
  const cityNorm = normalizeShareToken(cityName);
  if (!locNorm || locNorm === wardNorm || locNorm === cityNorm) return "";
  if (wardNorm && locNorm.includes(wardNorm)) return "";
  if (name && locNorm === normalizeShareToken(name)) return "";

  return loc;
}

function representativeAreaRedundant(area: string, wardLabel: string) {
  const areaNorm = normalizeShareToken(area);
  const { name, number } = parseWardLabel(wardLabel);
  if (name && areaNorm === normalizeShareToken(name)) return true;
  if (number && areaNorm === `ward${number}`) return true;
  if (areaNorm && normalizeShareToken(wardLabel).includes(areaNorm)) return true;
  return false;
}

/** Join logical blocks with a blank line between each. */
function joinSections(...sections: (string | null | undefined)[]): string {
  return sections.filter((s): s is string => Boolean(s?.trim())).join("\n\n");
}

/** Title on its own line, body lines below. */
function section(title: string, body: string | string[]): string {
  const lines = (Array.isArray(body) ? body : [body]).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return title;
  return `${title}\n${lines.join("\n")}`;
}

export function sharePhotoUrls(urls: string[] | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const url of urls ?? []) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= MAX_SHARE_PHOTOS) break;
  }
  return out;
}

export function formatSharePhotoSection(urls: string[]): string | null {
  const photos = sharePhotoUrls(urls);
  if (photos.length === 0) return null;
  if (photos.length === 1) {
    return section("Photo", photos[0]);
  }
  const numbered = photos.flatMap((url, i) => (i === 0 ? [`${i + 1}. ${url}`] : ["", `${i + 1}. ${url}`]));
  return section("Photos (attach on X)", numbered);
}

/** @deprecated Use formatSharePhotoSection — kept for callers that expect line arrays. */
export function formatSharePhotoLines(urls: string[]): string[] {
  const block = formatSharePhotoSection(urls);
  if (!block) return [];
  return ["", ...block.split("\n")];
}

/** Official X handles to @mention when sharing (by city id). */
const CITY_X_MENTIONS: Record<string, string> = {
  chennai: "@chennaicorp",
};

export function cityXMention(cityId?: string): string | null {
  if (!cityId) return null;
  return CITY_X_MENTIONS[cityId] ?? null;
}

function tagFor(value: string, fallback: string) {
  const tag = value.replace(/[^a-zA-Z0-9]/g, "");
  return tag || fallback;
}

/** For X intent `hashtags=` — comma-separated, no # prefix. */
export function shareHashtagsForCategory(category: string, cityName: string) {
  return `NammaPoruppu,${tagFor(cityName, "TamilNadu")},${tagFor(category, "CivicIssue")}`;
}

export function shareTagsLine(category: string, cityName: string) {
  const cityTag = tagFor(cityName, "TamilNadu");
  const typeTag = tagFor(category, "CivicIssue");
  return `#NammaPoruppu #${cityTag} #${typeTag}`;
}

export function buildIssueShareMessage(input: IssueShareInput): string {
  const wardLabel = normalizeWardLabelString(input.wardLabel);
  const placeLine = `${wardLabel}, ${input.cityName}`;
  const street = shareStreetAddress(wardLabel, input.cityName, input.address);

  const sections: string[] = [
    `Civic issue · ${placeLine}`,
    section("Issue type", input.category),
  ];

  if (street) {
    sections.push(section("Location", street));
  }

  const desc = input.description?.trim();
  if (desc) sections.push(section("Description", desc));

  if (input.representative) {
    const repLines = [`${input.representative.role} — ${input.representative.name}`];
    if (input.representative.area && !representativeAreaRedundant(input.representative.area, wardLabel)) {
      repLines.push(`Area: ${input.representative.area}`);
    }
    sections.push(section("Responsible official", repLines));
  }

  if (input.supportCount != null && input.supportCount > 0) {
    sections.push(
      section(
        "Community support",
        `${input.supportCount} support${input.supportCount === 1 ? "" : "s"}`,
      ),
    );
  }

  const mention = cityXMention(input.cityId);
  if (mention) sections.push(section("Tag on X", mention));

  const photoSection = formatSharePhotoSection(input.imageUrls ?? []);
  if (photoSection) sections.push(photoSection);

  sections.push(section("View & support", input.reportUrl));
  sections.push(shareTagsLine(input.category, input.cityName));

  return joinSections(...sections);
}

function trimTweetLines(lines: string[], maxChars: number): string {
  const kept: string[] = [];
  for (const line of lines) {
    const candidate = [...kept, line].join("\n");
    if (candidate.length <= maxChars) {
      kept.push(line);
    } else if (kept.length === 0) {
      kept.push(line.slice(0, maxChars - 1) + "…");
      break;
    } else {
      break;
    }
  }
  return kept.join("\n");
}

/** Tweet body only (URL and hashtags passed separately to X intent). */
export function buildIssueTweetText(input: IssueShareInput): string {
  const mention = cityXMention(input.cityId);
  const mentionLine = mention ?? null;
  const mentionSuffix = mentionLine ? `\n\n${mentionLine}` : "";
  const max = 220 - mentionSuffix.length;

  const wardLabel = normalizeWardLabelString(input.wardLabel);
  const placeLine = `${wardLabel}, ${input.cityName}`;
  const street = shareStreetAddress(wardLabel, input.cityName, input.address);

  const lines: string[] = [`Civic issue (${input.category})`, placeLine];
  if (street) lines.push(street);

  if (input.representative) {
    lines.push(`${input.representative.role}: ${input.representative.name}`);
  }

  const desc = input.description?.trim();
  if (desc) {
    const snippet = desc.length > 72 ? `${desc.slice(0, 69)}…` : desc;
    lines.push(`"${snippet}"`);
  }

  if (input.supportCount != null && input.supportCount > 0) {
    lines.push(`${input.supportCount} community supports`);
  }

  return trimTweetLines(lines, max) + mentionSuffix;
}

export function xIntentComposeUrl(text: string, reportUrl: string, hashtags: string) {
  const params = new URLSearchParams({
    text,
    url: reportUrl,
    hashtags,
  });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export function whatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildIssueTweetClipboard(input: IssueShareInput): string {
  const sections: string[] = [buildIssueTweetText(input), section("Link", input.reportUrl)];

  const photoSection = formatSharePhotoSection(input.imageUrls ?? []);
  if (photoSection) sections.push(photoSection);

  sections.push(section("Hashtags", shareTagsLine(input.category, input.cityName)));

  return joinSections(...sections);
}
