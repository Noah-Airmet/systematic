import { test } from "@playwright/test";

test.describe("MVP critical paths", () => {
  test.skip("sign up -> create system -> node -> validate", async () => {
    // Requires provisioned Supabase + Anthropic environment in CI.
  });

  test.skip("onboarding contradictions render", async () => {
    // Requires authenticated fixture account.
  });

  test.skip("drag node persists tier + validation limit path", async () => {
    // Requires seeded system and stable API keys.
  });
});
