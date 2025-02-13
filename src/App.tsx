import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./components/landing/LandingPage";
import routes from "tempo-routes";
import AuthProvider from "./components/auth/AuthProvider";

function App() {
  // Use the useRoutes hook for Tempo routes
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
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
      </Suspense>
    </AuthProvider>
  );
}

export default App;
