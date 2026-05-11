import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FamilyFeudLogo from "/images/FF-logo.png";
import {
  ListChecks,
  PlusSquare,
  UserPlus,
  KeyRound,
  LogOut,
  User,
  Presentation,
} from "lucide-react";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <User className="w-4 h-4" />
          <span className="truncate max-w-[200px]">{user?.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-8">
        {/* Title block */}
        <div className="w-full max-w-2xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <img
              src={FamilyFeudLogo}
              alt="Family Feud Logo"
              className="w-36 md:w-48 h-auto object-cover"
            />
            <p className="text-muted-foreground text-md tracking-[0.4em] uppercase mt-2 font-bold">
              Host Control Center
            </p>
          </div>
        </div>

        {/* Primary CTA — Host New Game */}
        <div className="w-full max-w-2xl">
          <Card
            className="bg-gradient-board border-gold-border border-8 shadow-board cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:[box-shadow:var(--shadow-board),0_0_40px_hsl(45,95%,55%,0.3)]"
            onClick={() => navigate("/host")}
          >
            <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-gold shadow-[0_0_30px_hsl(220,80%,45%,0.5)] group-hover:shadow-[0_0_50px_hsl(220,80%,45%,0.7)] transition-shadow duration-300">
                <Presentation
                  className="w-10 h-10 text-primary-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-center">
                <h2 className="game-board-font text-secondary text-xl sm:text-3xl tracking-wide uppercase">
                  Host New Game
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Create a session and start playing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary cards — Questions */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="bg-gradient-board border-gold-border border-4 shadow-board cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:border-8 hover:[box-shadow:var(--shadow-board),0_0_25px_hsl(200,100%,50%,0.25)]"
            onClick={() => navigate("/host/view-questions")}
          >
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-b from-[hsl(200,100%,50%)] to-[hsl(220,80%,45%)] shadow-[0_0_20px_hsl(200,100%,50%,0.4)] group-hover:shadow-[0_0_30px_hsl(200,100%,50%,0.6)] transition-shadow">
                <ListChecks className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <h3 className="game-board-font text-secondary text-xl tracking-wide uppercase">
                  Manage Questions
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  View, edit, and delete questions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-board border-gold-border border-4 shadow-board cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:border-8 hover:[box-shadow:var(--shadow-board),0_0_25px_hsl(200,100%,50%,0.25)]"
            onClick={() => navigate("/host/add-question")}
          >
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-b from-[hsl(122,56%,37%)] to-[hsl(122,42%,57%)] shadow-[0_0_20px_hsl(122,56%,37%,0.4)] group-hover:shadow-[0_0_30px_hsl(122,56%,37%,0.6)] transition-shadow">
                <PlusSquare className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <h3 className="game-board-font text-secondary text-xl tracking-wide uppercase">
                  Add Question
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  Create a new survey question
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account section */}
        <div className="w-full max-w-2xl">
          <p className="text-center text-muted-foreground text-ms tracking-[0.3em] uppercase mb-3 font-semibold">
            Account
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/create-account" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gold-border border-2 bg-transparent text-secondary hover:bg-[hsl(45,95%,55%,0.1)] hover:text-secondary gap-2 px-6 py-5"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Button>
            </Link>
            <Link to="/update-password" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gold-border border-2 bg-transparent text-secondary hover:bg-[hsl(45,95%,55%,0.1)] hover:text-secondary gap-2 px-6 py-5"
              >
                <KeyRound className="w-4 h-4" />
                Update Password
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full sm:w-auto border-destructive/50 border-2 bg-transparent text-destructive hover:bg-destructive/10 gap-2 px-6 py-5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-muted-foreground text-xs tracking-widest uppercase">
        Bona Banana &mdash; Family Feud
      </footer>
    </div>
  );
}
