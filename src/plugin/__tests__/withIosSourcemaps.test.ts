/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

import { withXcodeProject } from "@expo/config-plugins";

import withIosSourcemaps from "../withIosSourcemaps/withIosSourcemaps";
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
