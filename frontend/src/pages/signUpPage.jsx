import { SignupForm } from "@/components/auth/SignupForm.jsx"
export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 absolute inset-0 bg-gradient-purple">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  )
}
