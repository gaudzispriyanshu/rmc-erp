/**
 * Shared between client and edge — deliberately NOT in token.ts, which is a
 * "use client" module. Importing a client module from proxy.ts hands back a
 * client-reference proxy instead of the string, and the cookie check silently
 * never matches.
 */
export const TOKEN_KEY = "rmc_token";
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8;
