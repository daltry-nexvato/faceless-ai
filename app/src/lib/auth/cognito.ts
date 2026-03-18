import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand,
  ResendConfirmationCodeCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || "us-east-1",
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!;

function computeSecretHash(username: string): string {
  return crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

export async function cognitoSignUp(input: {
  email: string;
  password: string;
  name: string;
}): Promise<{ userSub: string }> {
  const result = await client.send(
    new SignUpCommand({
      ClientId: CLIENT_ID,
      SecretHash: computeSecretHash(input.email),
      Username: input.email,
      Password: input.password,
      UserAttributes: [
        { Name: "email", Value: input.email },
        { Name: "name", Value: input.name },
      ],
    })
  );

  return { userSub: result.UserSub! };
}

export async function cognitoConfirmSignUp(input: {
  email: string;
  code: string;
}): Promise<void> {
  await client.send(
    new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      SecretHash: computeSecretHash(input.email),
      Username: input.email,
      ConfirmationCode: input.code,
    })
  );
}

export async function cognitoResendCode(email: string): Promise<void> {
  await client.send(
    new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      SecretHash: computeSecretHash(email),
      Username: email,
    })
  );
}

export async function cognitoLogin(input: {
  email: string;
  password: string;
}): Promise<AuthenticationResultType> {
  const result = await client.send(
    new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: input.email,
        PASSWORD: input.password,
        SECRET_HASH: computeSecretHash(input.email),
      },
    })
  );

  return result.AuthenticationResult!;
}

export async function cognitoRefreshTokens(
  refreshToken: string,
  email: string
): Promise<AuthenticationResultType> {
  const result = await client.send(
    new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: computeSecretHash(email),
      },
    })
  );

  return result.AuthenticationResult!;
}

export async function cognitoForgotPassword(email: string): Promise<void> {
  await client.send(
    new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      SecretHash: computeSecretHash(email),
      Username: email,
    })
  );
}

export async function cognitoConfirmForgotPassword(input: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  await client.send(
    new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      SecretHash: computeSecretHash(input.email),
      Username: input.email,
      ConfirmationCode: input.code,
      Password: input.newPassword,
    })
  );
}

export async function cognitoGlobalSignOut(accessToken: string): Promise<void> {
  await client.send(
    new GlobalSignOutCommand({
      AccessToken: accessToken,
    })
  );
}
