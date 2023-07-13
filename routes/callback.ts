// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import {
  createUser,
  deleteUserBySession,
  getUser,
  newUserProps,
  updateUser,
  type User,
} from "@/utils/db.ts";
import { stripe } from "@/utils/payments.ts";
import { State } from "./_middleware.ts";
import { handleCallback } from "kv_oauth";
import { oauth2Client } from "@/utils/oauth2_client.ts";
import {
  deleteRedirectUrlCookie,
  getRedirectUrlCookie,
} from "@/utils/redirect.ts";

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  email: string;
}

const authUrl = Deno.env.get("AUTH0_URL")!;

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error();
  }
  return await response.json() as GitHubUser;
}

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req) {
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      oauth2Client,
      getRedirectUrlCookie(req.headers),
    );
    deleteRedirectUrlCookie(response.headers);

    const profile = await fetch(`${authUrl}/userinfo`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    const profileData = await profile.json();

    // Get data from KV about user (if possible)
    const user = await getUser(profileData.sub);

    if (!user) {
      // Create new user if needed
      let stripeCustomerId = undefined;
      if (stripe) {
        const customer = await stripe.customers.create({
          email: profileData.email,
        });
        stripeCustomerId = customer.id;
      }
      const user: User = {
        id: profileData.sub,
        login: profileData.email,
        avatarUrl: profileData.picture,
        stripeCustomerId,
        sessionId,
        ...newUserProps(),
      };
      await createUser(user);
    } else {
      // Update user
      await deleteUserBySession(sessionId);
      await updateUser({ ...user, sessionId });
    }

    return response;
  },
};
