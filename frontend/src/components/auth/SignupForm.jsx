import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
const signUpSchema = yup.object({
  firstname: yup.string().min(1, "Họ là bắt buộc" ),
  lastname: yup.string().min(1,  "Tên là bắt buộc" ),
  username: yup.string().min(3,  "Tên đầy đủ bắt buộc 3 ki tu" ),
  email: yup.string().email("Email không hợp lệ" ),
  password: yup.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự" ),
});

export function SignupForm( props ) {
  const {signUp} = useAuthStore();
  const navigate = useNavigate();
  const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm({
    resolver: yupResolver(signUpSchema)
  });

  const onSubmit =  async (data) => {
    const{firstname, lastname, username, email, password} = data;

    await signUp(firstname, lastname, username, email, password);

    navigate("/signin");

    console.log(data);
  }
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Tạo tài khoản mới </CardTitle>
        <CardDescription>
          Vui lòng điền các thông tin bên dưới để đăng ký.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <div className="flex flex-row items-center ">
              <Field className="mr-2">
                {/* first name */}
                <FieldLabel htmlFor="firstname">Họ</FieldLabel>
                <Input id="firstname" type="text" placeholder="John"  {...register("firstname")}/>
                {errors.firstname && <p className="text-sm text-red-600">{errors.firstname.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="lastname">Tên</FieldLabel>
                <Input id="lastname" type="text" placeholder="Doe"   {...register("lastname")}/>
                {errors.lastname && <p className="text-sm text-red-600">{errors.lastname.message}</p>}
              </Field>
              
            </div>
            <Field>
              <FieldLabel htmlFor="username">Ten su dung</FieldLabel>
              <Input id="username" type="text" placeholder="John Doe"  {...register("username")}/>
              {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password"  {...register("password")}/>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              <FieldDescription>
                Độ dài tối thiểu là 8 ký tự.
              </FieldDescription>
            </Field>
            
            <FieldGroup>
              <Field>
                <Button type="submit"
                  disabled={isSubmitting} className="w-full mt-4"                  
                >Create Account</Button>
      
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/signin">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}