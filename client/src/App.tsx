import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, RequireAuth } from "@/lib/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login-fixed";
import Dashboard from "@/pages/dashboard";
import CreateRoom from "@/pages/create-room";
import JoinRoom from "@/pages/join-room";
import RoomView from "@/pages/room-view";
import TransactionHistory from "@/pages/transaction-history";
import Settings from "@/pages/settings";
import { MainLayout } from "@/components/Layout/sidebar";
import { queryClient } from "@/lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <RequireAuth>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/create-room">
        <RequireAuth>
          <MainLayout>
            <CreateRoom />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/join-room">
        <RequireAuth>
          <MainLayout>
            <JoinRoom />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/room/:id">
        {params => (
          <RequireAuth>
            <MainLayout>
              <RoomView id={params.id} />
            </MainLayout>
          </RequireAuth>
        )}
      </Route>
      
      <Route path="/history">
        <RequireAuth>
          <MainLayout>
            <TransactionHistory />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/settings">
        <RequireAuth>
          <MainLayout>
            <Settings />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
