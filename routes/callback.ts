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

const authUrl = Deno.env.get("AUTH0_URL")!;

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
