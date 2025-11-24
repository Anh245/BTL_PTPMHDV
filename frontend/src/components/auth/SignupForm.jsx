import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import vi from '@/lib/translations';

const signUpSchema = yup.object({
  firstname: yup.string().min(1, vi.auth.signUp.validation.firstnameRequired),
  lastname: yup.string().min(1, vi.auth.signUp.validation.lastnameRequired),
  username: yup.string().min(3, vi.auth.signUp.validation.usernameMin),
  email: yup.string().email(vi.auth.signUp.validation.emailInvalid),
  password: yup.string().min(8, vi.auth.signUp.validation.passwordMin),
  confirmPassword: yup.string().oneOf([yup.ref('password')], vi.auth.signUp.validation.passwordMatch),
});

const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const labels = ['', vi.auth.signUp.weak, vi.auth.signUp.fair, vi.auth.signUp.good, vi.auth.signUp.strong, vi.auth.signUp.veryStrong];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return { strength, label: labels[strength], color: colors[strength] };
};

export function SignupForm(props) {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' });

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: yupResolver(signUpSchema)
  });

  const password = watch('password');

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
  }, [password]);

  const onSubmit = async (data) => {
    await registerUser({
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.username,
      email: data.email,
      password: data.password
    });
    navigate("/dashboard");
  };

  return (
    <Card {...props} className="animate-scale-in shadow-custom-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-glow">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">{vi.auth.signUp.title}</CardTitle>
        <CardDescription>
          {vi.auth.signUp.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <div className="flex flex-row items-start gap-2">
              <Field className="flex-1">
                <FieldLabel htmlFor="firstname">{vi.auth.signUp.firstName}</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="firstname" type="text" placeholder="John" className="pl-10" {...register("firstname")} />
                </div>
                {errors.firstname && <p className="text-sm text-destructive animate-fade-in">{errors.firstname.message}</p>}
              </Field>
              <Field className="flex-1">
                <FieldLabel htmlFor="lastname">{vi.auth.signUp.lastName}</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="lastname" type="text" placeholder="Doe" className="pl-10" {...register("lastname")} />
                </div>
                {errors.lastname && <p className="text-sm text-destructive animate-fade-in">{errors.lastname.message}</p>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="username">{vi.auth.signUp.username}</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="username" type="text" placeholder="johndoe" className="pl-10" {...register("username")} />
              </div>
              {errors.username && <p className="text-sm text-destructive animate-fade-in">{errors.username.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{vi.auth.signUp.email}</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={vi.auth.signUp.emailPlaceholder}
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive animate-fade-in">{errors.email.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">{vi.auth.signUp.password}</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && passwordStrength.strength > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {vi.auth.signUp.passwordStrength} <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && <p className="text-sm text-destructive animate-fade-in">{errors.password.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">{vi.auth.signUp.confirmPassword}</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive animate-fade-in">{errors.confirmPassword.message}</p>}
            </Field>
            
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">{vi.auth.signUp.creating}</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </>
                  ) : (
                    vi.auth.signUp.createButton
                  )}
                </Button>
                <FieldDescription className="px-6 text-center mt-4">
                  {vi.auth.signUp.haveAccount} <a href="/signin" className="font-semibold text-purple-600 hover:text-purple-700 hover:underline">{vi.auth.signUp.signInLink}</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
