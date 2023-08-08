// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Carousel from "../islands/Carousel.tsx";
import type { State } from "./_middleware.ts";
import { type User } from "@/utils/db.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render({ ...ctx.state });
  },
};

export default function HomePage(props: PageProps) {
  return (
    <main class="flex-1 p-4">
      <section>
        <h1 class="text-4xl font-bold">Denos should grow up outside!!!</h1>
        <p class="leading-6">marketing copy to go here</p>
      </section>
      <Carousel />
    </main>
  );
}
