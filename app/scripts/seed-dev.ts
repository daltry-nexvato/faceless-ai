import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.DYNAMODB_REGION || "us-east-1";
const prefix = process.env.DYNAMODB_TABLE_PREFIX || "FacelessAI-";

const baseClient = new DynamoDBClient({
  region,
  ...(endpoint ? { endpoint } : {}),
});

const db = DynamoDBDocumentClient.from(baseClient);

// Top 50 most common disposable email domains
const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "mailnesia.com", "maildrop.cc", "mailcatch.com",
  "temp-mail.org", "fakeinbox.com", "tempail.com", "trashmail.com",
  "trashmail.me", "trashmail.net", "10minutemail.com", "getairmail.com",
  "mohmal.com", "burnermail.io", "discard.email", "mailsac.com",
  "spamgourmet.com", "tempr.email", "anonbox.net", "mytemp.email",
  "getnada.com", "emailondeck.com", "mintemail.com", "tempmailo.com",
  "harakirimail.com", "33mail.com", "maildax.com", "binkmail.com",
  "bobmail.info", "chammy.info", "devnullmail.com", "letthemeatspam.com",
  "mailexpire.com", "mailmoat.com", "mailnull.com", "nogmail.com",
  "nomail.xl.cx", "nospam.ze.tc", "safersignup.de", "spamfree24.org",
  "trashymail.com", "wegwerfmail.de",
];

async function seedDisposableEmails() {
  const tableName = `${prefix}DisposableEmailDomains`;

  // DynamoDB BatchWrite supports max 25 items per request
  const batches: string[][] = [];
  for (let i = 0; i < DISPOSABLE_DOMAINS.length; i += 25) {
    batches.push(DISPOSABLE_DOMAINS.slice(i, i + 25));
  }

  for (const batch of batches) {
    await db.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map((domain) => ({
            PutRequest: {
              Item: { domain },
            },
          })),
        },
      })
    );
  }

  console.log(`Seeded ${DISPOSABLE_DOMAINS.length} disposable email domains`);
}

seedDisposableEmails().catch(console.error);
