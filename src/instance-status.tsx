import { Action, ActionPanel, Icon, List, Color, getPreferenceValues } from "@raycast/api";
import { useState } from "react";
import type { Preferences } from "@/lib/types/config";
import { testConnection } from "@/lib/hooks/useSonarrAPI";

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    version?: string;
  } | null>(null);

  const { http, host, port, base } = preferences;
  const baseUrl = base ? `/${base.replace(/^\/|\/$/g, "")}` : "";
  const sonarrUrl = `${http}://${host}:${port}${baseUrl}`;

  const handleTestConnection = async () => {
    setIsLoading(true);
    const result = await testConnection();
    setConnectionStatus({
      success: result.success,
      message: result.message,
      version: result.status?.version,
    });
    setIsLoading(false);
  };

  const statusIcon = connectionStatus?.success ? Icon.CheckCircle : Icon.XMarkCircle;
  const statusColor = connectionStatus?.success ? Color.Green : Color.Red;

  return (
    <List isLoading={isLoading}>
      <List.Section title="Sonarr Instance">
        <List.Item
          title="Connection Status"
          icon={{ source: statusIcon, tintColor: statusColor }}
          accessories={[
            {
              text: connectionStatus
                ? connectionStatus.success
                  ? `Connected (v${connectionStatus.version})`
                  : "Connection Failed"
                : "Not Tested",
            },
          ]}
          actions={
            <ActionPanel>
              <Action title="Test Connection" icon={Icon.Network} onAction={handleTestConnection} />
              <Action.OpenInBrowser title="Open Sonarr" url={sonarrUrl} icon={Icon.Globe} />
            </ActionPanel>
          }
        />

        <List.Item
          title="Instance URL"
          subtitle={sonarrUrl}
          icon={Icon.Link}
          accessories={[{ text: `${host}:${port}` }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open Sonarr" url={sonarrUrl} icon={Icon.Globe} />
              <Action.CopyToClipboard title="Copy URL" content={sonarrUrl} />
            </ActionPanel>
          }
        />

        <List.Item
          title="Protocol"
          subtitle={http.toUpperCase()}
          icon={http === "https" ? Icon.Lock : Icon.LockUnlocked}
          accessories={[{ text: http === "https" ? "Secure" : "Insecure" }]}
        />

        {connectionStatus && (
          <List.Item
            title="Status Message"
            subtitle={connectionStatus.message}
            icon={Icon.Info}
            accessories={[{ text: connectionStatus.success ? "✅" : "❌" }]}
          />
        )}
      </List.Section>

      <List.Section title="Quick Actions">
        <List.Item
          title="View Series Library"
          icon={Icon.List}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open Library" url={`${sonarrUrl}/series`} icon={Icon.Globe} />
            </ActionPanel>
          }
        />

        <List.Item
          title="View Calendar"
          icon={Icon.Calendar}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open Calendar" url={`${sonarrUrl}/calendar`} icon={Icon.Globe} />
            </ActionPanel>
          }
        />

        <List.Item
          title="View Queue"
          icon={Icon.Download}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser title="Open Queue" url={`${sonarrUrl}/queue`} icon={Icon.Globe} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
