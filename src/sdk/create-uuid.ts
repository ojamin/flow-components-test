/**
 * Package-owned UUID helper.
 *
 * Self-contained copy of `src/lib/create-uuid.ts`. Must not import from host
 * app paths. Works on insecure LAN HTTP origins where `crypto.randomUUID()`
 * is unavailable.
 */
export function createUuid(): string {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));

    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;

    return [
      encodeBytes(bytes.subarray(0, 4)),
      encodeBytes(bytes.subarray(4, 6)),
      encodeBytes(bytes.subarray(6, 8)),
      encodeBytes(bytes.subarray(8, 10)),
      encodeBytes(bytes.subarray(10, 16)),
    ].join("-");
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function encodeBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}
