/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withXcodeProject } from "@expo/config-plugins";

import withIosSourcemaps from "../withIosSourcemaps/withIosSourcemaps";
import expoSdk58Project from "./__fixtures__/expoSdk58ProjectPbxproj.json";
import pristineProject from "./__fixtures__/pristineProjectPbxproj.json";
import sentryProject from "./__fixtures__/sentryProjectPbxproj.json";

jest.mock("@expo/config-plugins", () => {
  return {
    ...(jest.requireActual("@expo/config-plugins") as object),
    withXcodeProject: jest.fn(),
  };
});

const mockXcodeProject = (mock: object) => {
  const xcodeProject = { ...mock };
  // @ts-ignore
  withXcodeProject.mockImplementationOnce((config, callback) => {
    // @ts-ignore
    return callback({
      ...config,
      modResults: {
        pbxItemByComment: () => xcodeProject,
      },
      xcodeProject,
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

describe("withIosSourcemaps", () => {
  beforeEach(() => {
    (withXcodeProject as any).mockClear();
  });
  describe("on pristine project", () => {
    it("adds script to upload sourcemaps to Datadog", async () => {
      mockXcodeProject(pristineProject);
      const result = (await withIosSourcemaps({})(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchSnapshot();
    });
    it("adds script to upload sourcemaps to Datadog with custom service name", async () => {
      mockXcodeProject(pristineProject);
      const result = (await withIosSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchSnapshot();
    });
  });
  describe("on Expo SDK 58+ project with quoted bundle command", () => {
    it("adds script to upload sourcemaps to Datadog outside of the quotes", async () => {
      mockXcodeProject(expoSdk58Project);
      const result = (await withIosSourcemaps({})(createFakeConfig())) as any;
      const { shellScript } = result.xcodeProject;
      expect(shellScript).not.toContain('\\"export SOURCEMAP_FILE');
      expect(shellScript).toContain(
        "$DATADOG_CI_EXEC react-native xcode \\\"`\\\"$NODE_BINARY\\\" --print \\\"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\\\"`\\\"\\n"
      );
      expect(shellScript).toMatchSnapshot();
    });
    it("adds script to upload sourcemaps to Datadog with custom service name", async () => {
      mockXcodeProject(expoSdk58Project);
      const result = (await withIosSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toContain(
        "'/scripts/react-native-xcode.sh'\\\"`\\\" --service com.company.app\\n"
      );
      expect(result.xcodeProject.shellScript).toMatchSnapshot();
    });
  });
  describe("when the script was already added", () => {
    it.each([
      ["pristine", pristineProject],
      ["Expo SDK 58+", expoSdk58Project],
      ["Sentry", sentryProject],
    ])("does not add it again on %s project", async (_, project) => {
      mockXcodeProject(project);
      const first = (await withIosSourcemaps({})(createFakeConfig())) as any;
      const { shellScript } = first.xcodeProject;
      mockXcodeProject(first.xcodeProject);
      const second = (await withIosSourcemaps({})(createFakeConfig())) as any;
      expect(second.xcodeProject.shellScript).toBe(shellScript);
    });
  });
  describe("on projects implementing Sentry", () => {
    it("adds script to upload sourcemaps to Datadog", async () => {
      mockXcodeProject(sentryProject);
      const result = (await withIosSourcemaps({})(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchSnapshot();
    });
    it("adds script to upload sourcemaps to Datadog with custom service name", async () => {
      mockXcodeProject(sentryProject);
      const result = (await withIosSourcemaps({
        serviceName: "com.company.app",
      })(createFakeConfig())) as any;
      expect(result.xcodeProject.shellScript).toMatchSnapshot();
    });
  });
});
