/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withAppBuildGradle } from "@expo/config-plugins";

import buildGradle from "./__fixtures__/build.gradle";
import withAndroidProguardMappingFiles from "../withAndroidProguardMappingFiles/withAndroidProguardMappingFiles";

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

describe("withAndroidProguardMappingFiles", () => {
  beforeEach(() => {
    (withAppBuildGradle as any).mockClear();
  });
  describe("without datadog gradle plugin version option", () => {
    it("uses the default version", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidProguardMappingFiles({})(
        createFakeConfig()
      )) as any;
      expect(result.modResults.contents).toMatch(
        'id("com.datadoghq.dd-sdk-android-gradle-plugin") version "1.+"'
      );
    });
  });
  describe("with datadog gradle plugin version option", () => {
    it("sets the provided version", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidProguardMappingFiles({
        datadogGradlePluginVersion: "1.9.0",
      })(createFakeConfig())) as any;
      expect(result.modResults.contents).toMatch(
        'id("com.datadoghq.dd-sdk-android-gradle-plugin") version "1.9.0"'
      );
    });
  });
});
