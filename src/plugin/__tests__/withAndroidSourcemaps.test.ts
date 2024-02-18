/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withAppBuildGradle } from "@expo/config-plugins";

import buildGradle from "./__fixtures__/build.gradle";
import withAndroidSourcemaps from "../withAndroidSourcemaps/withAndroidSourcemaps";

jest.mock("@expo/config-plugins", () => {
  return {
    ...(jest.requireActual("@expo/config-plugins") as object),
    withAppBuildGradle: jest.fn(),
  };
});

const mockAppBuildGradle = (mockContent: string) => {
  // @ts-ignore
  withAppBuildGradle.mockImplementationOnce((config, callback) => {
    // @ts-ignore
    return callback({
      ...config,
      modResults: {
        contents: mockContent,
      },
    });
  });
};

/**
 * This must return a new instance each time to avoid overriding the same object
 * on different tests
 */
const createFakeConfig = () => ({
  name: "project name",
  slug: "project-name",
});

describe("withAndroidSourcemaps", () => {
  beforeEach(() => {
    (withAppBuildGradle as any).mockClear();
  });
  describe("without datadog serviceName option", () => {
    it("adds datadog sourcemaps gradle plugin", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidSourcemaps({})(
        createFakeConfig()
      )) as any;
      expect(result.modResults.contents).toMatch("datadog-sourcemaps.gradle");
      expect(result.modResults.contents).not.toMatch("serviceName =");
    });
  });
  describe("with datadog serviceName option", () => {
    it("sets datadog sdk serviceName config", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.modResults.contents).toMatch(
        'serviceName = "com.company.app"'
      );
    });
    it("preserves existing datadog config", async () => {
      const configBlock = [
        `datadog {`,
        `    checkProjectDependencies = "none"`,
        `}`,
        ``,
      ].join("\n");
      mockAppBuildGradle(`${configBlock}${buildGradle}`);
      const result = (await withAndroidSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.modResults.contents).toMatch(
        'checkProjectDependencies = "none"'
      );
    });
  });
});
