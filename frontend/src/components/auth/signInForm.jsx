import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from '@/hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import vi from '@/lib/translations';

const signInSchema = yup.object({
  userName: yup.string().min(3, vi.auth.signIn.validation.usernameMin),
  password: yup.string().min(8, vi.auth.signIn.validation.passwordMin),
});

export function SigninForm(props) {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(signInSchema)
  });

  const onSubmit = async (data) => {
    await login({
      username: data.userName,
      password: data.password
    });
    navigate('/dashboard');
  };

  return (
    <Card {...props} className="animate-scale-in shadow-custom-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-glow">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">{vi.auth.signIn.title}</CardTitle>
        <CardDescription>
          {vi.auth.signIn.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className='flex flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='userName'>{vi.auth.signIn.username}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="userName"
                  type="text"
                  placeholder={vi.auth.signIn.usernamePlaceholder}
                  className="pl-10"
                  {...register("userName")}
                />
              </div>
              {errors.userName && <p className="text-sm text-destructive animate-fade-in">{errors.userName.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{vi.auth.signIn.password}</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                >
                  {vi.auth.signIn.forgotPassword}
                </a>
              </div>
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
              {errors.password && <p className="text-sm text-destructive animate-fade-in">{errors.password.message}</p>}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
            disabled={isSubmitting || isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2">{vi.auth.signIn.signingIn}</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              vi.auth.signIn.signInButton
            )}
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{vi.auth.signIn.noAccount} </span>
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-purple-600 hover:text-purple-700"
              onClick={() => navigate('/signup')}
            >
              {vi.auth.signIn.signUpLink}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
