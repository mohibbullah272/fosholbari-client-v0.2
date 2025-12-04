"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

// Bengali validation messages and regex patterns
const formSchema = z.object({
  name: z.string()
    .min(2, {
      message: "নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে।",
    })
    .max(50, {
      message: "নাম ৫০ অক্ষরের বেশি হতে পারবে না।",
    })
    .regex(/^[a-zA-Z\u0980-\u09FF\s]+$/, {
      message: "নামে শুধুমাত্র অক্ষর এবং স্পেস allowed.",
    }),

    phone: z.string()
    .min(11, {
      message: "মোবাইল নম্বর অবশ্যই কমপক্ষে ১১ ডিজিটের হতে হবে।",
    })
    .max(14, {
      message: "মোবাইল নম্বর ১৪ ডিজিটের বেশি হতে পারবে না।",
    })
    .regex(/^(\+88)?01[3-9]\d{8}$/, {
      message: "দয়া করে একটি বৈধ বাংলাদেশী মোবাইল নম্বর লিখুন।",
    }),
  password: z.string()
    .min(6,{
      message: "পাসওয়ার্ড অবশ্যই কমপক্ষে 6 অক্ষরের হতে হবে।",
    })
    .max(32, {
      message: "পাসওয়ার্ড ৩২ অক্ষরের বেশি হতে পারবে না।",
    })

})

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading,setLoading]=useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
    },
  })

 async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setLoading(true)
try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/createAccount`,{
    method:"POST",
    headers:{
        "content-type":"application/json"
    },
    body:JSON.stringify(values)
   }) 

if(res.ok){
    toast.success('অ্যাকাউন্ট তৈরি হয়েছে, আপনার অ্যাকাউন্ট অ্যাক্সেস করতে আবার লগইন করুন।')

    signIn("credentials",{
        callbackUrl:"/signin",
        ...values
    })
}
} catch (error:any) {
    console.log(error)
    toast.error(error?.message || "something went wrong")
}finally{
  setLoading(false)
}



  
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-border">
        <CardContent className="grid p-6 md:p-8 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                একাউন্ট তৈরি করুন
              </h2>
              <p className="text-muted-foreground">
                আপনার তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">পূর্ণ নাম *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="আপনার পূর্ণ নাম লিখুন" 
                          {...field} 
                          className="bg-background border-border"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        আপনার আসল নাম ব্যবহার করুন
                      </FormDescription>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

<FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">মোবাইল নম্বর *</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+8801*********" 
                          {...field} 
                          className="bg-background border-border"
                          onChange={(e) => {
                            // Auto-format phone number
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.startsWith('88')) {
                              field.onChange('+' + value);
                            } else if (value.startsWith('01')) {
                              field.onChange('+88' + value);
                            } else if (value) {
                              field.onChange('+880' + value);
                            } else {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        আমরা আপনার মোবাইল নম্বর শেয়ার করব না
                      </FormDescription>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

           

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">পাসওয়ার্ড *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="শক্তিশালী পাসওয়ার্ড লিখুন" 
                            {...field} 
                            className="bg-background border-border pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        কমপক্ষে ৮ অক্ষর, বড়-ছোট অক্ষর, সংখ্যা ও বিশেষ অক্ষর থাকতে হবে
                      </FormDescription>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 text-base font-medium"
                >
               {
                loading? <Loader className="animate-spin"></Loader>:<span>রেজিস্ট্রেশন সম্পন্ন করুন</span>
               }
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className={` bg-muted bg-[url('https://i.pinimg.com/736x/1d/85/11/1d8511b11ec30fb28ae1b248401b9b12.jpg')] bg-cover rounded-lg relative hidden md:flex items-center justify-center overflow-hidden`}>
       <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 text-center p-8">
       
              <h3 className="text-xl font-semibold text-white mb-3">
                আমাদের কমিউনিটিতে যোগ দিন
              </h3>
              <p className="text-white text-sm">
                বাংলাদেশের অন্যতম ক্রাউডফান্ডিং প্ল্যাটফর্মে আপনার ব্যবসার জন্য ফান্ড সংগ্রহ করুন
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}