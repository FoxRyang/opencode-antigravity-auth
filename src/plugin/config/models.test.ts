import { describe, expect, it } from "vitest";

import type { OpencodeConfig } from "../types";
import { applyOpencodeModelDefaults, OPENCODE_MODEL_DEFINITIONS } from "./models";

const getModel = (name: string) => {
  const model = OPENCODE_MODEL_DEFINITIONS[name];
  if (!model) {
    throw new Error(`Missing model definition for ${name}`);
  }
  return model;
};

describe("OPENCODE_MODEL_DEFINITIONS", () => {
  it("includes only the current Antigravity and Gemini CLI model set", () => {
    const modelNames = Object.keys(OPENCODE_MODEL_DEFINITIONS).sort();

    expect(modelNames).toEqual([
      "antigravity-claude-opus-4-6-thinking",
      "antigravity-claude-sonnet-4-6",
      "antigravity-gemini-3-flash",
      "antigravity-gemini-3.1-pro",
      "antigravity-gemini-3.5-flash",
      "gemini-3-flash",
      "gemini-3-flash-preview",
      "gemini-3.1-pro",
      "gemini-3.1-pro-preview-customtools",
      "gemini-3.5-flash",
    ]);
  });

  it("defines Gemini variants for registered Antigravity models", () => {
    expect(getModel("antigravity-gemini-3.1-pro").variants).toEqual({
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    });

    expect(getModel("antigravity-gemini-3-flash").variants).toEqual({
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    });

    expect(getModel("antigravity-gemini-3.5-flash").variants).toEqual({
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    });
  });

  it("defines thinking budget variants for Claude thinking models", () => {
    expect(getModel("antigravity-claude-opus-4-6-thinking").variants).toEqual({
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    });
  });
});

describe("applyOpencodeModelDefaults", () => {
  it("creates provider.google.models when config has no provider block", () => {
    const config: OpencodeConfig = {};

    applyOpencodeModelDefaults(config, "google");

    expect(config.provider?.google?.models?.["antigravity-gemini-3.5-flash"]).toEqual(
      OPENCODE_MODEL_DEFINITIONS["antigravity-gemini-3.5-flash"],
    );
    expect(config.provider?.google?.models?.["gemini-3.5-flash"]).toEqual(
      OPENCODE_MODEL_DEFINITIONS["gemini-3.5-flash"],
    );
  });

  it("preserves user model overrides over plugin defaults", () => {
    const userGeminiOverride = {
      name: "User Gemini 3.5 Flash",
      limit: { context: 123, output: 456 },
      modalities: { input: ["text"], output: ["text"] },
    };
    const config: OpencodeConfig = {
      provider: {
        google: {
          custom: true,
          models: {
            "gemini-3.5-flash": userGeminiOverride,
          },
        },
      },
    };

    applyOpencodeModelDefaults(config, "google");

    expect(config.provider?.google?.custom).toBe(true);
    expect(config.provider?.google?.models?.["gemini-3.5-flash"]).toBe(userGeminiOverride);
    expect(config.provider?.google?.models?.["antigravity-gemini-3.5-flash"]).toEqual(
      OPENCODE_MODEL_DEFINITIONS["antigravity-gemini-3.5-flash"],
    );
  });
});
