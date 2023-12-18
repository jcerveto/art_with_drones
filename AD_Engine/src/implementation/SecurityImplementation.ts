import * as crypto from "crypto";
import sha256 from 'crypto-js/sha256';
import aes from 'crypto-js/aes';


export async function encryptMessageBase64(message: string): Promise<string> {
    return Buffer.from(message).toString("base64");
}

export async function decryptMessageBase64(message: string): Promise<string> {
    return Buffer.from(message, "base64").toString("utf-8");
}


export async function encryptMessageAes(message: string, key: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function decryptMessageAes(message: string, key: string): Promise<string> {
    return aes.encrypt(message, key).toString();
}


export async function encryptMessageRsa(message: string, key: string): Promise<string> {
    return aes.encrypt(message, key);
}

export function encryptPassword(message: string): string {
    return sha256(message).toString();
}

export function generateNewKey(): string {
    return crypto.randomBytes(32).toString("hex");
}