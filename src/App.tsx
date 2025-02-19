import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./components/landing/LandingPage";
import routes from "tempo-routes";
import AuthProvider from "./components/auth/AuthProvider";
import { PaymentProvider } from "./features/payment/presentation/PaymentProvider";

function App() {
  // Use the useRoutes hook for Tempo routes
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <AuthProvider>
      <PaymentProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <p className="text-lg">Loading...</p>
            </div>
          }
        >
          <div>
            {/* Then render our app routes */}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<Home />} />
              {/* Add this to allow Tempo routes to work */}
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" />
              )}
            </Routes>

            {/* Render Tempo routes last */}
            {tempoRoutes}
          </div>
        </Suspense>
      </PaymentProvider>
    </AuthProvider>
  );
}

export default App;
