/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withAppBuildGradle } from "@expo/config-plugins";

import withAndroidConfiguration from "../withAndroidConfiguration/withAndroidConfiguration";
import buildGradle from "./__fixtures__/build.gradle";

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

describe("withAndroidConfiguration", () => {
  beforeEach(() => {
    (withAppBuildGradle as any).mockClear();
  });
  describe("without datadog serviceName option", () => {
    it("adds a datadog config block", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidConfiguration({})(
        createFakeConfig()
      )) as any;
      expect(result.modResults.contents).toMatch(
        'id("com.datadoghq.dd-sdk-android-gradle-plugin") version "1.22.0"'
      );
      expect(result.modResults.contents).toMatchSnapshot();
    });
  });
  describe("with datadog serviceName option", () => {
    it("adds a datadog config block with serviceName", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidConfiguration({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.modResults.contents).toMatchSnapshot();
    });
  });
  describe("with datadog gradle plugin version option", () => {
    it("sets the provided version", async () => {
      mockAppBuildGradle(buildGradle);
      const result = (await withAndroidConfiguration({
        datadogGradlePluginVersion: "1.9.0",
      })(createFakeConfig())) as any;
      expect(result.modResults.contents).toMatch(
        'id("com.datadoghq.dd-sdk-android-gradle-plugin") version "1.9.0"'
      );
    });
  });
});
