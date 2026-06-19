/**
 * Package-owned UUID helper.
 *
 * Self-contained copy of `src/lib/create-uuid.ts`. Must not import from host
 * app paths. Works on insecure LAN HTTP origins where `crypto.randomUUID()`
 * is unavailable.
 */
export declare function createUuid(): string;
