import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { useGetAutomationsQuery } from "@/redux/apiSlices/Automation/automationSlice";
import type { AutomationConfigOutputDto } from "@/types/api/data-contracts";
import { getRouteApi } from "@tanstack/react-router";
import { AutomationsDialogs } from "./components/automations-dialogs";
import { AutomationsPrimaryButtons } from "./components/automations-primary-buttons";
import { AutomationsProvider, useAutomations } from "./components/automations-provider";
import { AutomationsTable } from "./components/automations-table";

const route = getRouteApi("/_authenticated/automations/");

function AutomationsContent() {
  const { data: automationsData, isSuccess, isLoading, error } = useGetAutomationsQuery();
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { setOpen } = useAutomations();

  console.log("automationsData", automationsData);
  console.log("isSuccess:", isSuccess);
  console.log("isLoading:", isLoading);
  console.log("error:", error);

  let automations: AutomationConfigOutputDto[] = [];

  if (isSuccess && automationsData) {
    automations = automationsData.data || [];
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading automations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading automations</div>
      </div>
    );
  }

  return (
    <>
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
            <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
            <p className="text-muted-foreground">
              Configure email and Slack notification automations.
            </p>
          </div>
          <AutomationsPrimaryButtons 
            onCreateAutomation={() => setOpen('create')}
          />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <AutomationsTable
            data={automations}
            search={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate={navigate as any}
          />
        </div>
      </Main>

      <AutomationsDialogs />
    </>
  );
}

export function Automations() {
  return (
    <AutomationsProvider>
      <AutomationsContent />
    </AutomationsProvider>
  );
}

