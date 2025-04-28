"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const createUser = useMutation(api.auth.createUser);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [justAuthenticated, setJustAuthenticated] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // When the user becomes authenticated, create their user profile
  useEffect(() => {
    if (isAuthenticated && justAuthenticated) {
      // Create the user in our database
      createUser()
        .then(() => {
          console.log("User profile created successfully");
          setJustAuthenticated(false);
        })
        .catch((err) => {
          console.error("Error creating user profile:", err);
        });
    }
  }, [isAuthenticated, justAuthenticated, createUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      // Create a FormData object with the correct fields
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", flow); // This is important - tells Convex whether to sign in or sign up
      
      // Call the password provider with the form data
      await signIn("password", formData);
      
      // Mark that we just authenticated to trigger user creation
      setJustAuthenticated(true);
      
      // Clear the form
      if (flow === "signUp") {
        setEmail("");
        setPassword("");
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const toastTitle =
        flow === "signIn"
          ? "Could not sign in, did you mean to sign up?"
          : "Could not sign up, did you mean to sign in?";
      toast.error(toastTitle);
      setError(toastTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <input
          className="input-field"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm text-slate-600">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-blue-500 cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow" />
        <span className="mx-4 text-slate-400 ">or</span>
        <hr className="my-4 grow" />
      </div>
      <button className="auth-button" onClick={() => void signIn("anonymous")}>
        Sign in anonymously
      </button>
    </div>
  );
}
