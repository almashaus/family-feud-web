import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { createUser } from "@/services/supabaseAuth";
import { validateCredentials } from "@/lib/tools/validation";

const CreateAccount = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validation, setValidation] = useState({
    isEmailValid: false,
    emailErrors: [""],
    isPasswordValid: false,
    passwordErrors: [""],
  });

  const { toast } = useToast();

  useEffect(() => {
    const result = validateCredentials(email, password);
    setValidation(() => {
      return {
        isEmailValid: result.isEamilValid,
        emailErrors: result.errors.emailError,
        isPasswordValid: result.isPasswordVaild,
        passwordErrors: result.errors.passwordError,
      };
    });
  }, [email, password]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: `Please enter a ${
          !name.trim() ? "name" : !email.trim() ? "email" : "password"
        }`,
        variant: "destructive",
      });
      return;
    }

    const result = await createUser({
      email: email,
      password: password,
      displayName: name,
      isAdmin: true,
    });

    if (result.success) {
      console.log("User created successfully:", result.userId);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Unknown error occurred",
        variant: "destructive",
      });
    }
    // Reset form
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card className="mx-auto bg-gradient-board border-gold-border border-8 md:p-6 shadow-board max-w-2xl w-full">
          <CardHeader className="flex flex-row justify-between">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" strokeWidth={4} />
              </Button>
            </Link>

            <CardTitle className="text-3xl font-bold text-secondary">
              Create New Account
            </CardTitle>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              disabled
            ></Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Type the name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg bg-muted border-gold-border border-2"
              />
            </div>

            {/* email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Type the email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg bg-muted border-gold-border border-2"
              />
              {!validation.isEmailValid && (
                <span className="text-red-400">
                  {validation.emailErrors.filter((e) => e).join(", ")}
                </span>
              )}
            </div>

            {/* password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-semibold">
                Password
              </Label>
              <Input
                id="password"
                placeholder="Type the password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg bg-muted border-gold-border border-2"
              />
              {!validation.isPasswordValid && (
                <span className="text-red-400">
                  {validation.passwordErrors.filter((e) => e).join(", ")}
                </span>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="green"
                onClick={handleSave}
                className="md:px-24 py-6 text-lg gap-2"
                disabled={
                  !validation.isEmailValid ||
                  !validation.isPasswordValid ||
                  !name
                }
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAccount;
