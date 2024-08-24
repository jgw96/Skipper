export class SimpleCrypto {
    private static readonly algorithm = {
        name: "AES-GCM",
        length: 256
    };
    private static readonly ivLength = 12; // AES-GCM standard

    /**
     * Generate a cryptographic key for AES-GCM encryption
     */
    static async generateKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(this.algorithm, true, ["encrypt", "decrypt"]);
    }

    /**
     * Encrypt a plaintext string using AES-GCM
     * @param key - The cryptographic key to use for encryption
     * @param plaintext - The plaintext string to encrypt
     */
    static async encrypt(key: CryptoKey, plaintext: string): Promise<string> {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
        const ciphertext = await crypto.subtle.encrypt(
            {
                ...this.algorithm,
                iv
            },
            key,
            encoder.encode(plaintext)
        );

        const ivAndCiphertext = new Uint8Array(iv.length + ciphertext.byteLength);
        ivAndCiphertext.set(iv, 0);
        ivAndCiphertext.set(new Uint8Array(ciphertext), iv.length);

        return btoa(String.fromCharCode(...ivAndCiphertext));
    }

    /**
     * Decrypt a ciphertext string using AES-GCM
     * @param key - The cryptographic key to use for decryption
     * @param encrypted - The base64-encoded string to decrypt
     */
    static async decrypt(key: CryptoKey, encrypted: string): Promise<string> {
        const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
        const iv = data.slice(0, this.ivLength);
        const ciphertext = data.slice(this.ivLength);

        const plaintextBuffer = await crypto.subtle.decrypt(
            {
                ...this.algorithm,
                iv
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(plaintextBuffer);
    }

    /**
     * Export the cryptographic key to a JWK format for safe storage
     * @param key - The cryptographic key to export
     * @returns A JSON Web Key (JWK) that can be safely stored
     */
    static async exportKey(key: CryptoKey): Promise<JsonWebKey> {
        return crypto.subtle.exportKey("jwk", key);
    }

    /**
     * Import a cryptographic key from a JWK format
     * @param jwk - The JSON Web Key to import
     * @returns A CryptoKey that can be used for encryption and decryption
     */
    static async importKey(jwk: JsonWebKey): Promise<CryptoKey> {
        return crypto.subtle.importKey("jwk", jwk, this.algorithm, true, ["encrypt", "decrypt"]);
    }
}
