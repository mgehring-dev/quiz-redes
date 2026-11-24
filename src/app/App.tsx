import { QueryClient, QueryClientProvider } from "react-query";

import { QuizPage } from "./pages/quiz";
import { SettingsProvider } from "./shared/contexts/Settings";
import { AdminSidebar } from "./shared/components/AdminSidebar";

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
      <AdminSidebar />
      <QuizPage />
    </SettingsProvider>
  </QueryClientProvider>
);
