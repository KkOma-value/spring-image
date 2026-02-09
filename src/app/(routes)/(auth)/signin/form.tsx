"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SignInSchema, SignInValues } from "./validate";
import InputStartIcon from "../components/input-start-icon";
import InputPasswordContainer from "../components/input-password";
import { cn } from "@/lib/utils";
import { AtSign } from "lucide-react";

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4"
  >
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.4c-.2 1.2-1.5 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.6 3.2 14.5 2.2 12 2.2 7 2.2 3 6.2 3 11.2s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.4H12z"
    />
  </svg>
);

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: SignInValues) {
    startTransition(async () => {
      const response = await signIn.username(data);

      if (response.error) {
        console.log("SIGN_IN:", response.error.message);
        toast.error(response.error.message);
      } else {
        router.push("/");
      }
    });
  }

  const onGoogleSignIn = () => {
    startTransition(async () => {
      const response = await signIn.social({
        provider: "google",
      });

      if (response?.error) {
        console.log("GOOGLE_SIGN_IN:", response.error.message);
        toast.error(response.error.message);
      }
    });
  };

  const getInputClassName = (fieldName: keyof SignInValues) =>
    cn(
      form.formState.errors[fieldName] &&
        "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
    );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="z-50 my-8 flex w-full flex-col gap-5"
      >
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onGoogleSignIn}
          className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-white/60">
          <span className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputStartIcon icon={AtSign}>
                  <Input
                    placeholder="Username"
                    className={cn("peer ps-9", getInputClassName("username"))}
                    disabled={isPending}
                    {...field}
                  />
                </InputStartIcon>
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
              <FormControl>
                <InputPasswordContainer>
                  <Input
                    id="input-23"
                    className={cn("pe-9", getInputClassName("password"))}
                    placeholder="Password"
                    disabled={isPending}
                    {...field}
                  />
                </InputPasswordContainer>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="mt-5 w-full bg-gradient-to-r from-cny-gold to-yellow-600 text-red-950 shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:shadow-[0_0_35px_rgba(255,215,0,0.55)]"
        >
          Sign In
        </Button>
      </form>
    </Form>
  );
}
