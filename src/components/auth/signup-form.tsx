
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

const signupFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  mobileNumber: z.string().min(1, { message: "Mobile number is required." }), // Simple validation for now
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: ""
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true);
    try {
      await signUpWithEmail(values.email, values.password);
      // TODO: Handle mobileNumber if needed, e.g., store in Firestore profile
      toast({
        title: "Account Created!",
        description: "You can now log in with your new account.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Signed Up with Google!",
        description: "Welcome! You are now logged in.",
      });
      router.push("/dashboard"); // Or wherever you want to redirect after Google sign-up
    } catch (error: any) {
      toast({
        title: "Google Sign-Up Failed",
        description: error.message || "Could not sign up with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2 pt-8 pb-6">
        <h1 className="text-5xl font-bold text-foreground tracking-tight">Yucca</h1>
        <p className="text-xl font-semibold text-foreground">Sign Up for Yucca</p>
        <p className="text-sm text-muted-foreground">Create your account to get started</p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="yourname@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Mobile Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-enter Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">
              or
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
           <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path><path fill="none" d="M1 1h22v22H1z"></path></svg>
          {isLoading ? "Processing..." : "Continue with Google"}
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Button variant="link" asChild className="p-0 text-primary">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
