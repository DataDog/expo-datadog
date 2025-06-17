/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withAppBuildGradle } from "@expo/config-plugins";

import withAndroidSourcemaps from "../withAndroidSourcemaps/withAndroidSourcemaps";
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
      modRequest: {
        projectRoot: '..'
      },
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
  it("adds datadog sourcemaps gradle plugin", async () => {
    mockAppBuildGradle(buildGradle);
    const result = (await withAndroidSourcemaps(createFakeConfig())) as any;
    expect(result.modResults.contents).toMatch("../../expo-datadog/node_modules/@datadog/mobile-react-native/datadog-sourcemaps.gradle");
  });
});
