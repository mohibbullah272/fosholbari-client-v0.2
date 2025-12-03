import { getToken } from "next-auth/jwt" 
import { NextResponse } from "next/server" 
import type { NextRequest } from "next/server" 
const secret = process.env.AUTH_SECRET
 const roleBasedRoutes: Record<string, RegExp[]> = { ADMIN: [/^\/dashboard\/admin/], INVESTOR: [/^\/dashboard\/investor/], } 


 export async function middleware(req: NextRequest) { const token = await getToken({ req, secret }) 

 // if no session, redirect to login 

 if (!token) { return NextResponse.redirect(new URL("/signin", req.url)) } const role = token.role || "guest" 

 const pathname = req.nextUrl.pathname // check allowed routes 

 const allowedRoutes = roleBasedRoutes[role] 

// if user’s role doesn’t have access to this path 
if ( allowedRoutes && !allowedRoutes.some((route) => route.test(pathname)) ) { 
  // logout user if unauthorized return 
  NextResponse.redirect(new URL("/signin", req.url)) } return NextResponse.next() }
  
  export const config = { matcher: ["/dashboard/:path*"], }