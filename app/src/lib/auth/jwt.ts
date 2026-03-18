import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const REGION = process.env.COGNITO_REGION || "us-east-1";
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/jwks.json`;
const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`;

// Cached JWKS — jose handles caching and rotation internally
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(JWKS_URL));
  }
  return jwks;
}

export interface CognitoTokenPayload extends JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  "cognito:username"?: string;
  token_use: "id" | "access";
  client_id?: string;
}

export async function verifyAccessToken(token: string): Promise<CognitoTokenPayload> {
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer: ISSUER,
  });

  // Verify it's an access token
  if (payload.token_use !== "access") {
    throw new Error("Token is not an access token");
  }

  // Verify client_id matches
  if (payload.client_id !== CLIENT_ID) {
    throw new Error("Token client_id mismatch");
  }

  return payload as CognitoTokenPayload;
}

export async function verifyIdToken(token: string): Promise<CognitoTokenPayload> {
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer: ISSUER,
    audience: CLIENT_ID,
  });

  if (payload.token_use !== "id") {
    throw new Error("Token is not an ID token");
  }

  return payload as CognitoTokenPayload;
}

export function decodeTokenPayload(token: string): CognitoTokenPayload {
  // Decode without verification — for lightweight middleware checks only
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf-8")
  );

  return payload as CognitoTokenPayload;
}
