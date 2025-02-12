import { Button } from "../ui/button";
import { useAuth } from "./AuthProvider";
import { LogIn, LogOut } from "lucide-react";

export function LoginButton() {
  const { user, signIn, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Error signing in: " + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Error signing out: " + (error as Error).message);
    }
  };

  return user ? (
    <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  ) : (
    <Button variant="ghost" size="sm" onClick={handleSignIn} className="gap-2">
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}
