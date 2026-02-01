/**
 * Login Page
 *
 * Professional desktop application login with comprehensive features:
 * - Form validation with real-time feedback
 * - Keyboard shortcuts and accessibility
 * - Loading states and error handling
 * - Remember me functionality
 * - Password visibility toggle
 * - Desktop-optimized UI
 *
 * @module routes/login
 */

import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { useTranslation, useDirection } from "@meditrack/i18n";

const logger = createLogger("LoginPage");

// ============================================================================
// Types & Schemas
// ============================================================================

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  session_expired: z.boolean().optional(),
});

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

interface FormTouched {
  username: boolean;
  password: boolean;
}

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: loginSearchSchema,
});

// ============================================================================
// Validation Schema
// ============================================================================

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    username: z
      .string()
      .min(1, t("login:errors.username.required"))
      .min(3, t("login:errors.username.minLength"))
      .max(50, t("login:errors.username.maxLength"))
      .regex(/^[a-zA-Z0-9._-]+$/, t("login:errors.username.invalid")),
    password: z
      .string()
      .min(1, t("login:errors.password.required"))
      .min(8, t("login:errors.password.minLength")),
  });

// ============================================================================
// Component
// ============================================================================

function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const { t } = useTranslation("login");
  const { isRTL } = useDirection();

  // Create validation schema with translations
  const loginSchema = createLoginSchema(t);

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    username: false,
    password: false,
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Refs
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // Session Expired Notification
  // ============================================================================

  useEffect(() => {
    if (search.session_expired) {
      setErrors({
        general: t("errors.sessionExpired"),
      });
    }
  }, [search.session_expired, t]);

  // ============================================================================
  // Redirect if Already Authenticated
  // ============================================================================

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = search.redirect || "/";
      logger.info("User already authenticated, redirecting to:", redirectTo);
      navigate({ to: redirectTo });
    }
  }, [isAuthenticated, authLoading, navigate, search.redirect]);

  // ============================================================================
  // Account Lockout Logic
  // ============================================================================

  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      const lockoutDuration = 5 * 60 * 1000; // 5 minutes
      const unlockTime = Date.now() + lockoutDuration;
      setLockoutTime(unlockTime);

      const timer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
        setLockoutTime(null);
        setErrors({});
      }, lockoutDuration);

      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  // ============================================================================
  // Real-time Validation
  // ============================================================================

  const validateField = useCallback(
    (field: "username" | "password", value: string) => {
      try {
        if (field === "username") {
          loginSchema.shape.username.parse(value);
          setErrors((prev) => ({ ...prev, username: undefined }));
        } else {
          loginSchema.shape.password.parse(value);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field]: error.issues[0]?.message,
          }));
        }
      }
    },
    [],
  );

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (touched.username) {
      validateField("username", value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validateField("password", value);
    }
  };

  const handleUsernameBlur = () => {
    setTouched((prev) => ({ ...prev, username: true }));
    validateField("username", username);
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    validateField("password", password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // ============================================================================
  // Form Validation
  // ============================================================================

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ username, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          formErrors[field] = err.message;
        });
        setErrors(formErrors);
      }
      return false;
    }
  };

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked) {
      return;
    }

    // Mark all fields as touched
    setTouched({ username: true, password: true });

    // Validate form
    if (!validateForm()) {
      // Focus first error field
      if (errors.username) {
        usernameRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      }
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      logger.info("Attempting login for user:", username);

      await login({ username, password });

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("remember_username", username);
      } else {
        localStorage.removeItem("remember_username");
      }

      // Reset login attempts on success
      setLoginAttempts(0);

      logger.info("Login successful");

      // Navigate after successful login
      const redirectTo = search.redirect || "/";
      navigate({ to: redirectTo });
    } catch (err) {
      logger.error("Login failed:", err);

      // Increment login attempts
      setLoginAttempts((prev) => prev + 1);

      const errorMessage =
        err instanceof Error ? err.message : t("errors.loginFailed");

      setErrors({ general: errorMessage });

      // Focus password field for retry
      passwordRef.current?.focus();
      passwordRef.current?.select();
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Keyboard Shortcuts
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Submit on Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit(e as unknown as React.FormEvent);
      }

      // Toggle password visibility with Ctrl/Cmd + Shift + P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        togglePasswordVisibility();
      }

      // Focus username field with Alt + U
      if (e.altKey && e.key === "u") {
        e.preventDefault();
        usernameRef.current?.focus();
      }

      // Focus password field with Alt + P
      if (e.altKey && e.key === "p") {
        e.preventDefault();
        passwordRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [username, password]);

  // ============================================================================
  // Load Remembered Username
  // ============================================================================

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("remember_username");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
      // Focus password field if username is pre-filled
      setTimeout(() => passwordRef.current?.focus(), 100);
    }
  }, []);

  // ============================================================================
  // Lockout Timer Display
  // ============================================================================

  const getLockoutTimeRemaining = (): string => {
    if (!lockoutTime) return "";
    const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ============================================================================
  // Render Loading State
  // ============================================================================

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t("appName")}</h1>
          <p className="text-sm text-muted-foreground">{t("appTagline")}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error Alert */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("errors.authFailed")}</AlertTitle>
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Account Lockout Alert */}
              {isLocked && (
                <Alert variant="destructive">
                  <Lock className="h-4 w-4" />
                  <AlertTitle>{t("errors.accountLocked")}</AlertTitle>
                  <AlertDescription>
                    {t("errors.accountLockedMessage")}{" "}
                    <strong>{getLockoutTimeRemaining()}</strong>
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Attempts Warning */}
              {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("errors.attemptsRemaining", {
                      count: 5 - loginAttempts,
                    })}
                  </AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  {t("form.username.label")}
                  <kbd className="ml-auto text-[10px] px-1 py-0.5 bg-muted rounded opacity-60">
                    {t("form.username.shortcut")}
                  </kbd>
                </Label>
                <div className="relative">
                  <Input
                    ref={usernameRef}
                    id="username"
                    type="text"
                    placeholder={t("form.username.placeholder")}
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    disabled={isLoading || isLocked}
                    autoComplete="username"
                    autoFocus={!username}
                    aria-invalid={!!errors.username}
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
                    className={cn(
                      errors.username &&
                        touched.username &&
                        "border-destructive",
                      !errors.username &&
                        touched.username &&
                        username &&
                        "border-green-500",
                    )}
                  />
                  {touched.username && username && !errors.username && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.username && touched.username && (
                  <p
                    id="username-error"
                    className="text-xs text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5" />
                    {t("form.password.label")}
                    <kbd className="ml-auto text-[10px] px-1 py-0.5 bg-muted rounded opacity-60">
                      {t("form.password.shortcut")}
                    </kbd>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("form.password.placeholder")}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    disabled={isLoading || isLocked}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={cn(
                      "pr-10",
                      errors.password &&
                        touched.password &&
                        "border-destructive",
                      !errors.password &&
                        touched.password &&
                        password &&
                        "border-green-500",
                    )}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading || isLocked}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? t("form.password.hide")
                        : t("form.password.show")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p
                    id="password-error"
                    className="text-xs text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading || isLocked}
                    className="h-4 w-4 rounded border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-xs font-normal cursor-pointer"
                  >
                    {t("form.rememberMe")}
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                  disabled={isLoading || isLocked}
                  onClick={() => {
                    // TODO: Implement forgot password
                    logger.info("Forgot password clicked");
                  }}
                >
                  {t("form.forgotPassword")}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || isLocked || !username || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("form.signingIn")}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {t("form.signIn")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2 text-center">
            {/* Keyboard Shortcuts */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">{t("shortcuts.title")}</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                <span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    Ctrl
                  </kbd>
                  {" + "}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    Enter
                  </kbd>{" "}
                  {t("shortcuts.signIn")}
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    Ctrl
                  </kbd>
                  {" + "}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    Shift
                  </kbd>
                  {" + "}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
                    P
                  </kbd>{" "}
                  {t("shortcuts.togglePassword")}
                </span>
              </div>
            </div>

            {/* Development Mode Hint */}
            {import.meta.env.DEV && (
              <div
                className={cn(
                  "mt-2 p-2 bg-muted/50 rounded w-full",
                  isRTL ? "text-right" : "text-left",
                )}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  <strong className="text-foreground">
                    {t("development.title")}
                  </strong>
                </p>
                <div className="space-y-1 text-xs font-mono">
                  <p>
                    <strong>{t("development.username")}</strong> admin
                  </p>
                  <p>
                    <strong>{t("development.password")}</strong> admin123
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {t("development.note")}
                  </p>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-xs text-muted-foreground">
          {t("security.notice")}
        </p>
      </div>
    </div>
  );
}
