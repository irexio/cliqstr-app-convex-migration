/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as cliqNotices from "../cliqNotices.js";
import type * as cliqs from "../cliqs.js";
import type * as invites from "../invites.js";
import type * as memberships from "../memberships.js";
import type * as posts from "../posts.js";
import type * as profiles from "../profiles.js";
import type * as scrapbook from "../scrapbook.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  cliqNotices: typeof cliqNotices;
  cliqs: typeof cliqs;
  invites: typeof invites;
  memberships: typeof memberships;
  posts: typeof posts;
  profiles: typeof profiles;
  scrapbook: typeof scrapbook;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
