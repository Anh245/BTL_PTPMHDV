import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import React from 'react'
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthStore } from '@/stores/useAuthStore.js'
import { useNavigate } from 'react-router'
const signInSchema = yup.object({
 
  userName: yup.string().min(3,  "Tên bắt buộc 3 ki tu" ),
  password: yup.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự" ),
});

export function SigninForm ( props ) {
    const {signIn} = useAuthStore();
  const navigate = useNavigate();
  const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm({
    resolver: yupResolver(signInSchema)
  });

  const onSubmit =  async (data) => {
    const{ username, password} = data;

    await signIn(username, password);

    navigate("/");

    console.log(data);
    }
  return (
    
    
      <Card {...props}>
        <CardHeader >
          <CardTitle> Vui long dang nhap vao tai khoan cua ban</CardTitle>
        
           <div className="flex justify-between items-center gap-x-2">
              <CardDescription className="inline-block">
                Bạn là người dùng mới?
              </CardDescription>
              <Button variant="link" onClick={() => window.location.href = "/signup"} >Sign Up</Button>
              
            </div>
          
        </CardHeader>
       <CardContent>
        <form  onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className='flext flex-col gap-6'>
            <div className='grid gap-2'>
              <Label htmlFor='username'>userName</Label>
               <Input id="username" type="text"
                placeholder='Nhap ten nguoi dung'
                {...register("username")}
               />
               {errors.userName && <p className="text-sm text-red-600">{errors.userName.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" {...register("password")}/>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

          </div>
           <Button type="submit" className="w-full mb-4" disabled={isSubmitting}>
              Login
            </Button>
        </form>
       </CardContent>
       <CardFooter className="gap-8 mt-7 block">
             
           

       </CardFooter>
      </Card>

  )
}


