import { showHUD, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { HealthCheckType } from "@/lib/types/system";
import type { Preferences } from "@/lib/types/config";
import type { SystemStatus, HealthCheck } from "@/lib/types/system";

export default async function Command() {
  try {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking Sonarr status...",
    });

    const systemPromise = fetch(getSystemStatusUrl());
    const healthPromise = fetch(getHealthUrl());

    const [systemResponse, healthResponse] = await Promise.all([systemPromise, healthPromise]);

    if (!systemResponse.ok || !healthResponse.ok) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to connect to Sonarr";
      toast.message = `HTTP ${systemResponse.status}`;
      return;
    }

    const systemStatus = (await systemResponse.json()) as SystemStatus;
    const healthChecks = (await healthResponse.json()) as HealthCheck[];

    const errors = healthChecks.filter((check) => check.type === HealthCheckType.Error);
    const warnings = healthChecks.filter((check) => check.type === HealthCheckType.Warning);

    const statusLines: string[] = [];
    statusLines.push(`Sonarr v${systemStatus.version}`);
    statusLines.push(`OS: ${systemStatus.osName}`);

    if (errors.length > 0) {
      statusLines.push(`❌ ${errors.length} error${errors.length > 1 ? "s" : ""}`);
    }

    if (warnings.length > 0) {
      statusLines.push(`⚠️ ${warnings.length} warning${warnings.length > 1 ? "s" : ""}`);
    }

    if (errors.length === 0 && warnings.length === 0) {
      statusLines.push("✅ All systems operational");
    }

    await showHUD(statusLines.join(" • "));
  } catch (error) {
    await showHUD(`❌ Failed to check status: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function getSystemStatusUrl(): string {
  const preferences = getPreferenceValues<Preferences>();
  const { http, host, port, base, apiKey } = preferences;
  const baseUrl = base ? `/${base.replace(/^\/|\/$/g, "")}` : "";
  return `${http}://${host}:${port}${baseUrl}/api/v3/system/status?apikey=${apiKey}`;
}

function getHealthUrl(): string {
  const preferences = getPreferenceValues<Preferences>();
  const { http, host, port, base, apiKey } = preferences;
  const baseUrl = base ? `/${base.replace(/^\/|\/$/g, "")}` : "";
  return `${http}://${host}:${port}${baseUrl}/api/v3/health?apikey=${apiKey}`;
}
