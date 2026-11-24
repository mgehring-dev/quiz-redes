import { QueryClient, QueryClientProvider } from "react-query";

import { QuizPage } from "./pages/quiz";
import { SettingsProvider } from "./shared/contexts/Settings";
import { AdminSidebar } from "./shared/components/AdminSidebar";
import { EnvBadge } from "./shared/components/EnvBadge";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <EnvBadge />
      <AdminSidebar />
      <QuizPage />
    </SettingsProvider>
  </QueryClientProvider>
);
