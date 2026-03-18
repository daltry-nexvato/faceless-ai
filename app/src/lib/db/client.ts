import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.DYNAMODB_REGION || "us-east-1";

const baseClient = new DynamoDBClient({
  region,
  ...(endpoint ? { endpoint } : {}),
});

export const db = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table name helper — uses prefix from env for environment isolation
const prefix = process.env.DYNAMODB_TABLE_PREFIX || "FacelessAI-";

export const Tables = {
  Accounts: `${prefix}Accounts`,
  TeamMemberships: `${prefix}TeamMemberships`,
  DisposableEmailDomains: `${prefix}DisposableEmailDomains`,
  Channels: `${prefix}Channels`,
  Styles: `${prefix}Styles`,
  StyleVersions: `${prefix}StyleVersions`,
} as const;
