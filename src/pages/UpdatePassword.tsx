import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { createUser, updatePassword } from "@/services/supabaseAuth";
import { validateCredentials, validatePassword } from "@/lib/tools/validation";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [validation, setValidation] = useState({
    isPasswordValid: false,
    passwordErrors: [""],
  });

  const { toast } = useToast();

  useEffect(() => {
    const result = validatePassword(password);
    setValidation(() => {
      return {
        isPasswordValid: result.isValid,
        passwordErrors: result.errors,
      };
    });
  }, [password]);

  const handleSave = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: `Please enter a password`,
        variant: "destructive",
      });
      return;
    }

    const result = await updatePassword({ newPassword: password });

    if (result.success) {
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
              Update the password
            </CardTitle>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              disabled
            ></Button>
          </CardHeader>

          <CardContent className="space-y-6">
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
                disabled={!validation.isPasswordValid}
              >
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;
