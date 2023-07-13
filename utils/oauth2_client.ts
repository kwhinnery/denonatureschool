// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";
const authUrl = Deno.env.get("AUTH0_URL")!;

export const oauth2Client = new OAuth2Client({
  clientId: Deno.env.get("AUTH0_CLIENT_ID")!,
  clientSecret: Deno.env.get("AUTH0_CLIENT_SECRET")!,
  authorizationEndpointUri: `${authUrl}/oauth/authorize`,
  tokenUri: `${authUrl}/oauth/token`,
  redirectUri: Deno.env.get("AUTH_REDIRECT_URI")!,
  defaults: {
    scope: "openid profile email",
  },
});
