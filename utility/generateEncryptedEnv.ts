// encrypt/decrypt/parse .env files
// Contains functions to upload secrets directly to cloud repo
// - encrypt .env file and save it to .env.encrypted file
// - decrypt .env.encrypted file and save it to .env.encrypted file
// - parse .env.encrypted file and config them to process.env

import CryptoJS from "crypto-js";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

const prodEnvFiles = [".env.prod", ".env"];
const devEnvFiles = [".env.dev", ".env"];

const configDotenv = (envFile: string) =>
  dotenv.config({
    path: envFile,
  });

const getFilePath = (file: string) => path.resolve(process.env.PWD, file);

const getEnvFile = () => {
  // Use .env.prod if NODE_ENV is production
  // or .env.dev or .env if NODE_ENV is not production
  const envFiles =
    process.env.NODE_ENV === "production" ? prodEnvFiles : devEnvFiles;

  // Get existing .env file
  let envFilePath = "";
  for (const file of envFiles) {
    envFilePath = fs.existsSync(getFilePath(file)) ? file : "";
    if (envFilePath !== "") {
      break;
    }
  }

  // If no .env file exists, throw error
  if (envFilePath === "") {
    throw new Error("env file not found");
  }

  return getFilePath(envFilePath);
};

const setupPlainEnv = () => {
  // Get the plain .env file
  const plainEnvFile = getEnvFile();

  // Set up dotenv to read the plain .env file
  configDotenv(plainEnvFile);

  // Extract the encryption key from the .env file
  const encryptionKey = process.env.ENCRYPTION_KEY || "";
  if (encryptionKey === "") {
    throw new Error("ENCRYPTION_KEY not found in .env file");
  }
};

/**
 * @description Encrypts the .env file and saves it to .env.encrypted
 */
export function encryptSecrets() {
  setupPlainEnv();

  // Get the plain .env file
  const plainEnvFile = getEnvFile();

  // Read the .env file
  const envFile = fs.readFileSync(plainEnvFile, "utf8");

  // Encrypt the file
  const encrypted = CryptoJS.AES.encrypt(
    envFile,
    process.env.ENCRYPTION_KEY
  ).toString();

  // Write it to the .env.encrypted file
  const encryptedEnvFilePath = path.resolve(process.env.PWD, ".env.encrypted");
  fs.appendFileSync(encryptedEnvFilePath, encrypted);
}

/**
 * @description Decrypts the .env.encrypted file and saves it to .env.decrypted
 */
export function decryptSecrets() {
  setupPlainEnv();

  const encryptedEnvFilePath = path.resolve(process.env.PWD, ".env.encrypted");
  // Read the .env.encrypted file
  const envStrings = fs.readFileSync(encryptedEnvFilePath, "utf8");

  // Decrypt the file
  const decrypted = CryptoJS.AES.decrypt(
    envStrings,
    process.env.ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);

  // Write it to the .env.decrypted file
  const decryptedEnvFilePath = path.resolve(process.env.PWD, ".env.decrypted");
  fs.appendFileSync(decryptedEnvFilePath, decrypted);
}

/**
 * @description Decrypts the .env.encrypted file and saves it to process.env
 */
export function configSecrets() {
  // Get the path to the .env file
  const filePath = getEnvFile();

  // Set up dotenv
  configDotenv(filePath);

  // Extract the encryption key from the .env file
  const encryptionKey = process.env.ENCRYPTION_KEY || "";

  if (encryptionKey === "") {
    throw new Error("ENCRYPTION_KEY not found in .env file");
  }

  const encryptedFilePath = path.resolve(process.env.PWD, ".env.encrypted");
  // Read the .env.encrypted file
  const envStrings = fs.readFileSync(encryptedFilePath, "utf8");

  // Decrypt the file
  const decrypted = CryptoJS.AES.decrypt(envStrings, encryptionKey).toString(
    CryptoJS.enc.Utf8
  );

  // Split the env properties
  const properties = decrypted.split("=");

  // Iterate each property and save it to process.env
  properties.forEach(([key, value]) => {
    if (key && value) {
      process.env[key] = value;
    }
  });
}
