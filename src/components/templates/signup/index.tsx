"use client";

import { FloatingLabelInput } from "@/components/molecules/floating-label-input";
import { Button } from "@/components/atoms/button";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/api/use-auth";
import Link from "next/link";

const SignupTemplate = () => {
  const router = useRouter();
  const {
    initiateAuth,
    verifyAuth,
    resendVerificationCode,
    isLoading,
    error: authError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState("");

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    try {
      const result = await initiateAuth(email.toLowerCase());

      if (result && result.session) {
        setSession(result.session);
        setIsVerifying(true);
        setError("");
      } else {
        setError("Failed to initialize signup. Please try again.");
      }
    } catch (err) {
      console.error("Failed to initiate signup:", err);
      setError("Failed to send verification email. Please try again.");
    }
  };

  const handleVerificationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    try {
      const result = await verifyAuth(email, verificationCode, session);

      if (result.success) {
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err) {
      console.error("Failed to verify code:", err);
      setError("Failed to verify code. Please try again.");
    }
  };

  const handleBackToSignup = () => {
    setIsVerifying(false);
    setVerificationCode("");
    setError("");
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError("Email address is missing");
      return;
    }

    try {
      const result = await resendVerificationCode(email, session);

      if (result && result.session) {
        setSession(result.session);
      }
    } catch (err) {
      console.error("Failed to resend code:", err);
      setError("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <div className="w-screen h-screen px-11 py-6 relative bg-stone-100 inline-flex flex-col justify-start items-start gap-2.5">
      <div className="self-stretch flex-1 flex flex-col justify-between items-center">
        <div className="self-stretch inline-flex justify-between items-center">
          <Link href="/" className="flex justify-start items-center gap-1.5">
            <Image
              src="/media/Logo.png"
              alt="EchoMe Logo"
              width={100}
              height={40}
            />
          </Link>
          <div className="justify-start">
            <span className="text-stone-600 text-sm font-medium font-['Satoshi'] leading-tight">
              Already have an account?{" "}
            </span>
            <Link
              href="/signin"
              className="text-zinc-900 text-sm font-medium font-['Satoshi'] underline leading-tight"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="w-96 p-8 bg-white rounded-[20px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 flex flex-col justify-start items-center gap-6 overflow-hidden">
          {!isVerifying ? (
            <>
              <div className="self-stretch flex flex-col justify-start items-center gap-2">
                <div className="p-4 bg-gradient-to-b from-gray-500/10 to-gray-500/0 rounded-[999px] inline-flex justify-start items-center gap-4 overflow-hidden">
                  <div className="p-4 bg-stone-100 rounded-[999px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] outline outline-1 outline-offset-[-1px] outline-stone-200 flex justify-center items-center overflow-hidden">
                    <User size={32} className="text-zinc-900" />
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-center gap-1">
                  <div className="self-stretch text-center justify-start text-zinc-900 text-2xl font-medium font-['Satoshi'] leading-loose">
                    Create your account
                  </div>
                  <div className="self-stretch text-center justify-start text-stone-600 text-base font-normal font-['Satoshi'] leading-normal">
                    Enter your email to get started with EchoMe.
                  </div>
                </div>
              </div>

              <div className="self-stretch inline-flex justify-center items-center gap-2">
                <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-stone-200"></div>
              </div>

              <form
                onSubmit={handleEmailSubmit}
                className="self-stretch flex flex-col justify-start items-center gap-3"
              >
                <FloatingLabelInput
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  required
                  className="w-full"
                />
                <Button
                  className="w-full px-2.5 py-3 h-12 rounded-[10px] bg-zinc-900 hover:bg-zinc-800 text-white"
                  disabled={isLoading || !email}
                  type="submit"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToSignup}
                className="self-start flex items-center text-zinc-900 hover:text-zinc-700"
                disabled={isLoading}
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>

              <div className="self-stretch flex flex-col justify-start items-center gap-2">
                <div className="self-stretch text-center justify-start text-zinc-900 text-2xl font-medium font-['Satoshi'] leading-loose">
                  Check your email
                </div>
                <div className="self-stretch text-center justify-start text-stone-600 text-base font-normal font-['Satoshi'] leading-normal">
                  We sent a verification code to {email}
                </div>
              </div>

              <form
                onSubmit={handleVerificationSubmit}
                className="self-stretch flex flex-col justify-start items-center gap-3"
              >
                <FloatingLabelInput
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter the code from your email"
                  disabled={isLoading}
                  required
                  className="w-full"
                />
                <Button
                  className="w-full px-2.5 py-3 h-12 rounded-[10px] bg-zinc-900 hover:bg-zinc-800 text-white"
                  disabled={isLoading || !verificationCode}
                  type="submit"
                >
                  {isLoading ? "Verifying..." : "Verify & Complete"}
                </Button>
              </form>

              <div className="self-stretch flex flex-col gap-4 text-sm text-center">
                <button
                  onClick={handleResendEmail}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Didn&apos;t receive a code? Resend
                </button>
                <div className="text-stone-600">
                  Check your spam folder if you don&apos;t see the email
                </div>
              </div>
            </>
          )}

          {(error || authError) && (
            <div className="text-red-500 text-sm text-center mt-2">
              {error || authError}
            </div>
          )}
        </div>

        <div className="self-stretch inline-flex justify-start items-center gap-3">
          <div className="flex-1 justify-start text-stone-600 text-sm font-normal font-['Satoshi'] leading-tight">
            © 2025 EchoMe
          </div>
          <div className="flex justify-start items-center gap-1 overflow-hidden">
            <div className="flex justify-start items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-stone-300 flex items-center justify-center">
                <span className="text-xs text-stone-600">🌐</span>
              </div>
              <div className="justify-start text-stone-600 text-sm font-medium uppercase leading-tight">
                ENG
              </div>
              <div className="w-4 h-4 rounded-full bg-stone-300 flex items-center justify-center">
                <span className="text-xs text-stone-600">▼</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupTemplate;
