import { coolify as createApi } from "coolify-typescript-sdk";

export enum CoolifyFailedVerificationReason {
  CoolifyNotInstalled = "Coolify is not installed",
  CoolifyNotHealthy = "Coolify API is not healthy",
}

export class Coolify {
  private static instance: ReturnType<typeof createApi>;

  private constructor(token) {
    if (!token) {
      token = process.env.COOLIFY_API_TOKEN; // set your token in the environment variables (recommended)
    }

    Coolify.instance = createApi(token, {
      host: "localhost",
      secure: false,
    });
  }

  public static async authenticate(token: string) {
    Coolify.instance = createApi(token, {
      host: "localhost",
      secure: false,
    });

    const isHealthy = await Coolify.instance.healthCheck();
    if (!isHealthy) {
      throw new Error("Coolify API is not healthy, cannot proceed!");
    }

    try {
      await Coolify.instance.listServers();
    } catch (error) {
      throw new Error("Failed to authenticate with Coolify");
    }

    return Coolify;
  }

  public static get() {
    if (!Coolify.instance) {
      return createApi("", {
        host: "localhost",
        secure: false,
      });
    }

    return Coolify.instance;
  }

  public static async verifyInstallation(): Promise<{
    verified: boolean;
    reason?: CoolifyFailedVerificationReason;
  }> {
    const coolifyApiClient = Coolify.get();

    try {
      const isHealthy = await coolifyApiClient.healthCheck();

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
        throw error;
      }

      return {
        verified: false,
        reason: CoolifyFailedVerificationReason.CoolifyNotInstalled,
      };
    }
  }
}
