import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Comparison from "@/pages/comparison";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile";
import SavedItineraries from "@/pages/saved-itineraries";
import Statistics from "@/pages/statistics";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/comparison/:id" component={Comparison} />
      <Route path="/comparison" component={Comparison} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/profile">{() => <ProfilePage />}</Route>
      <Route path="/saved-itineraries">{() => <SavedItineraries />}</Route>
      <Route path="/statistics" component={Statistics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
