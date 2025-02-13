import { useState } from "react";
import { Button } from "../ui/button";
import { useAuth } from "./AuthProvider";
import { LogIn, LogOut } from "lucide-react";
import AuthDialog from "./AuthDialog";

function LoginButton() {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Error signing out: " + (error as Error).message);
    }
  };

  return (
    <>
      {user ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAuthDialog(true)}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      )}

      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </>
  );
}

export default LoginButton;
