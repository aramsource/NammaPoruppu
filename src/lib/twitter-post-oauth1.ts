import crypto from "node:crypto";

/**
 * Post a tweet using OAuth 1.0a user context (API key + user access token).
 * Used for the official @nammaporuppu account when env vars are set.
 * @see https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets-create
 */

function percentEncode(s: string) {
  return encodeURIComponent(s)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function oauthBodyHash(body: string) {
  return crypto.createHash("sha256").update(body, "utf8").digest("base64");
}

function hmacSha1Base64(key: string, text: string) {
  return crypto.createHmac("sha1", key).update(text, "utf8").digest("base64");
}

export type TwitterPostResult =
  | { ok: true; id: string; text: string }
  | { ok: false; status: number; body: string };

export async function postTweetV2OAuth1(opts: {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  text: string;
}): Promise<TwitterPostResult> {
  const url = "https://api.twitter.com/2/tweets";
  const body = JSON.stringify({ text: opts.text });

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: opts.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: opts.accessToken,
    oauth_version: "1.0",
    oauth_body_hash: oauthBodyHash(body),
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k]!)}`)
    .join("&");

  const baseString = `POST&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(opts.consumerSecret)}&${percentEncode(opts.accessTokenSecret)}`;
  const oauth_signature = hmacSha1Base64(signingKey, baseString);

  const headerParams = { ...oauthParams, oauth_signature };
  const authHeader =
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(headerParams[k as keyof typeof headerParams]!)}"`)
      .join(", ");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body,
  });

  const raw = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, body: raw };
  }
  try {
    const json = JSON.parse(raw) as { data?: { id?: string; text?: string } };
    const id = json.data?.id;
    if (!id) return { ok: false, status: 500, body: raw };
    return { ok: true, id, text: json.data?.text ?? opts.text };
  } catch {
    return { ok: false, status: 500, body: raw };
  }
}
