import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ChatSession from "@/pages/ChatSession";
import Dealers from "@/pages/Dealers";
import Listings from "@/pages/Listings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/c/:id" component={ChatSession} />
      <Route path="/dealers" component={Dealers} />
      <Route path="/listings" component={Listings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Ensure background color fills whole viewport to avoid white flashes
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[#080b14] text-white selection:bg-primary/30">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
