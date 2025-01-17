// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import type { AccountState } from "./_middleware.ts";
import { BUTTON_STYLES } from "@/utils/constants.ts";
import { ComponentChild } from "preact";
import { stripe } from "@/utils/payments.ts";

export const handler: Handlers<AccountState, AccountState> = {
  GET(_request, ctx) {
    ctx.state.title = "Account";

    return ctx.render(ctx.state);
  },
};

interface RowProps {
  title: string;
  children?: ComponentChild;
  text: string;
  rowClass?: string;
}

function Row(props: RowProps) {
  return (
    <li class="py-4">
      <div class={`flex flex-wrap justify-between ${props.rowClass}`}>
        <span>
          <strong>{props.title}</strong>
        </span>
        {props.children && <span>{props.children}</span>}
      </div>
      <p>
        {props.text}
      </p>
    </li>
  );
}

export default function AccountPage(props: PageProps<AccountState>) {
  const action = props.data.user.isSubscribed ? "Manage" : "Upgrade";

  return (
    <main class="max-w-lg m-auto w-full flex-1 p-4 flex flex-col justify-center">
      <img
        src={props.data.user?.avatarUrl}
        alt="User Avatar"
        crossOrigin="anonymous"
        class="max-w-[50%] self-center rounded-full aspect-square mb-4 md:mb-6"
      />
      <ul>
        <Row
          title="Username"
          text={props.data.user.login}
        />
        {props.data.user.isStaff
          ? (
            <Row
              title="Staff Member"
              text={""}
              rowClass="italic text-red-500"
            />
          )
          : ""}
        <Row
          title="Subscription"
          text={props.data.user.isSubscribed ? "Premium 🦕" : "Free"}
        >
          {stripe && (
            <a
              class="underline"
              href={`/account/${action.toLowerCase()}`}
            >
              {action}
            </a>
          )}
        </Row>
      </ul>
      <a
        href="/signout"
        class={`${BUTTON_STYLES} block text-center mt-8`}
      >
        Sign out
      </a>
    </main>
  );
}
