import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { useGetAllAutomationLogsQuery } from "@/redux/apiSlices/Automation/automationSlice";
import { getRouteApi } from "@tanstack/react-router";
import { AutomationLogsTable } from "./components/automation-logs-table";
import { AutomationLogsProvider } from "./components/automation-logs-provider";

const route = getRouteApi("/_authenticated/automation-logs/");

export function AutomationLogs() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  
  // Get the key from URL search params if available
  const automationKey = search.key as string | undefined;
  
  const { data: logsData, isSuccess, isLoading, error } = useGetAllAutomationLogsQuery(
    automationKey ? { automationKey } : undefined
  );

  console.log("logsData", logsData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);

  let logs = [];

  if (isSuccess && logsData) {
    logs = logsData.data || [];
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading logs</div>
      </div>
    );
  }

  return (
    <AutomationLogsProvider>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Automation Logs</h2>
            <p className="text-muted-foreground">
              View execution history for all automations.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <AutomationLogsTable
            data={logs}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>
    </AutomationLogsProvider>
  );
}

