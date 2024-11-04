import consola from "consola";
import { ExecutionResult } from "../utils/execution-result";
import { CoolifyServer } from "./types/server";
import { CoolifyApplications } from "./applications";

export enum CoolifyFailedVerificationReason {
  CoolifyNotInstalled = "Coolify is not installed",
  CoolifyNotHealthy = "Coolify API is not healthy",
}

export enum CoolifyAuthenticationFailureReason {
  FailedToAuthenticate = "Failed to authenticate with Coolify",
}

class CoolifyApiError extends Error {
  public originalError?: Error;
  public code: number;
  public details?: any;

  constructor(fetchError: Error);
  constructor(code: number, message: string, details?: any);
  constructor(
    fetchErrorOrCode: Error | number,
    message?: string,
    details?: any
  ) {
    if (typeof fetchErrorOrCode === "number") {
      super(message);
      this.details = details;
      this.code = fetchErrorOrCode;
      this.name = "CoolifyApiError";
      return;
    }

    super(fetchErrorOrCode.message);
    this.details = details;
    this.name = "CoolifyApiError";
    this.originalError = fetchErrorOrCode;
    this.stack = fetchErrorOrCode.stack;
    this.code = (fetchErrorOrCode as any).code || 500;
  }
}

export class Coolify {
  private static instance: Coolify;
  private token?: string;
  public applications: CoolifyApplications;

  private constructor(token?: string) {
    this.token = token;
    this.applications = new CoolifyApplications(this);
  }

  public static async authenticate(
    token: string
  ): Promise<ExecutionResult<CoolifyAuthenticationFailureReason>> {
    Coolify.instance = new Coolify(token);

    const isHealthy = await Coolify.instance.isHealthy();
    if (!isHealthy) {
      throw new Error("Coolify API is not healthy, cannot proceed!");
    }

    try {
      await Coolify.instance.listServers();
    } catch (error) {
      consola.error("Failed to authenticate with Coolify");
      consola.error(error);
      return {
        success: false,
        reason: CoolifyAuthenticationFailureReason.FailedToAuthenticate,
      };
    }

    return { success: true };
  }

  public static get() {
    if (!Coolify.instance) {
      return new Coolify();
    }

    return Coolify.instance;
  }

  public async verifyInstallation(): Promise<{
    verified: boolean;
    reason?: CoolifyFailedVerificationReason;
  }> {
    try {
      const isHealthy = await this.isHealthy();

      if (!isHealthy) {
        return {
          verified: false,
          reason: CoolifyFailedVerificationReason.CoolifyNotHealthy,
        };
      }

      return {
        verified: true,
      };
    } catch (error) {
      if (error.message !== "fetch failed") {
        console.error(`request failed with error message "${error.message}" and name: "${error.name}"`);
        throw error;
      }

      return {
        verified: false,
        reason: CoolifyFailedVerificationReason.CoolifyNotInstalled,
      };
    }
  }

  public async fetch<TResult>(
    path: string,
    options?: RequestInit & { returnText?: boolean }
  ): Promise<TResult> {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    const response = await fetch("http://127.0.0.1:8000/api" + path, {
      ...options,
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : undefined,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const content = await response.text();

    if (response.status < 200 || response.status >= 300) {
      let jsonContent;
      try {
        jsonContent = JSON.parse(content);
      } catch (error) {
        console.info("Coolify Error Response not json...");
      }

      throw new CoolifyApiError(
        response.status,
        jsonContent?.message || content
      );
    }

    if (options?.returnText) {
      return content as TResult;
    }

    try {
      return JSON.parse(content) as TResult;
    } catch (error) {
      throw new CoolifyApiError(500, "Failed to parse response", {
        body: content,
      });
    }
  }

  public async isHealthy(): Promise<boolean> {
    const responseText = await this.fetch<string>("/health", {
      returnText: true,
    });

    return responseText === "OK";
  }

  public async listServers(): Promise<CoolifyServer[]> {
    return await this.fetch("/v1/servers");
  }
}
