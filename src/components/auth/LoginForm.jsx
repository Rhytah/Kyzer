// src/components/auth/LoginForm.jsx (Simple validation)
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import toast from "react-hot-toast";

export default function LoginForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Custom validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return true;
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return true;
  };

  const onSubmit = async (data) => {
    try {
      // Validate manually since we're not using zodResolver
      const emailError = validateEmail(data.email);
      const passwordError = validatePassword(data.password);

      if (emailError !== true || passwordError !== true) {
        if (emailError !== true) toast.error(emailError);
        if (passwordError !== true) toast.error(passwordError);
        return;
      }

      const result = await login(data.email, data.password);

      if (result.error) {
        toast.error(result.error.message || "Login failed");
        return;
      }

      toast.success("Welcome back!");
      onSuccess?.();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-dark mb-2"
        >
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-text-light" />
          </div>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            type="email"
            id="email"
            autoComplete="email"
            disabled={isLoading}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg 
              placeholder-text-muted text-text-dark
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-background-medium disabled:cursor-not-allowed
              transition-colors
              ${
                errors.email
                  ? "border-red-300 bg-red-50"
                  : "border-background-dark bg-white hover:border-primary-light"
              }
            `}
            placeholder="Enter your email"
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text-dark mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-text-light" />
          </div>
          <input
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            disabled={isLoading}
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-lg 
              placeholder-text-muted text-text-dark
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-background-medium disabled:cursor-not-allowed
              transition-colors
              ${
                errors.password
                  ? "border-red-300 bg-red-50"
                  : "border-background-dark bg-white hover:border-primary-light"
              }
            `}
            placeholder="Enter your password"
          />
          <button
            type="button"
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-text-light hover:text-text-medium transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-text-light hover:text-text-medium transition-colors" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            disabled={isLoading}
            className="h-4 w-4 text-primary border-background-dark rounded focus:ring-primary/20 focus:ring-2"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-text-medium"
          >
            Remember me
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex justify-center items-center py-3 px-4 border border-transparent 
          rounded-lg shadow-sm text-sm font-medium text-white 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20
          transition-all duration-200
          ${
            isLoading
              ? "bg-primary/70 cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark hover:shadow-md transform hover:-translate-y-0.5"
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>

    
    </form>
  );
}
