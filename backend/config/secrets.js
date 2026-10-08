import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import dotenv from "dotenv";

export const loadSecrets = async () => {
  // First, always load from .env so local development works and acts as fallback
  dotenv.config();

  const secretName = process.env.AWS_SECRET_NAME || "FoodDeliveryAppSecrets";
  const region = process.env.AWS_REGION || "us-east-1";

  // Check if we should attempt AWS Secrets Manager
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
    console.log("No AWS credentials found, continuing with .env file secrets only.");
    return;
  }

  const client = new SecretsManagerClient({ region });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      // Overwrite/Inject into process.env
      for (const [key, value] of Object.entries(secrets)) {
        process.env[key] = value;
      }
      console.log(`Successfully loaded secrets from AWS Secrets Manager (${secretName})`);
    }
  } catch (error) {
    console.warn(`Failed to fetch secrets from AWS Secrets Manager: ${error.message}`);
    console.log("Falling back to local .env configuration.");
  }
};
