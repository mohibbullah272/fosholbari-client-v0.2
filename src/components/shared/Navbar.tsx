"use client";

import { LogOut, MenuIcon } from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Logo from "../Logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { ModeToggle } from "@/helpers/theme-toggle";
import NotificationBell from "../notification/NotificationBell";

const Navbar5 = () => {
const pathName=usePathname()
const user = useSession()


  return (
    <section className="py-4 sticky top-0 z-50 bg-white/20 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-2 ">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
          <Logo></Logo>
            <span className="text-lg font-semibold tracking-tighter">
            ফসল বাড়ি
            </span>
          </Link>
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
         
              <NavigationMenuItem>
                <Link
                  href="/"
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30 ",
                    pathName === '/'? "bg-primary/20 backdrop-blur-md":""
                    )}
                >
                 Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/about"
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/about'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
                    )}
                >
               About Us
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/projects"
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/projects'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
                    )}
                >
                  Projects
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/Contact "
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/contact'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
                    )}
                >
             Contact Us
                </Link>
              </NavigationMenuItem>
              {
  user.data?.user.role ==="INVESTOR" && <NavigationMenuItem>
  <Link
    href="/dashboard/investor/user-overview"
    className={cn(
      "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
      pathName === '/dashboard/investor/user-overview'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
      )}
  >
Dashboard
  </Link>
</NavigationMenuItem>
 }


              {
  user.data?.user.role ==="ADMIN" && <NavigationMenuItem>
  <Link
    href="/dashboard/admin/overview"
    className={cn(
      "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
      pathName === '/dashboard/admin/overview'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
      )}
  >
Dashboard
  </Link>
</NavigationMenuItem>
 }
          <ModeToggle></ModeToggle>
          <NotificationBell></NotificationBell>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden items-center gap-4 lg:flex">
  {
    user?.data?.user.phone ? (<div className="flex items-center gap-4">
 <div className="bg-primary flex items-center justify-center rounded-full w-12 h-12 text-white">{user.data.user.name?.slice(0,2).toUpperCase()}</div>
 <Button onClick={()=>signOut()} variant='ghost' className="flex items-center gap-2">Logout <LogOut></LogOut></Button>
    </div>):(<>
            <Link
          href={'/signin'}
          >
          <Button variant="outline">Sign in</Button>
          </Link>
            <Link
                href={'/register'}>
                <Button>Register</Button>
                </Link>
    </>)
  }
          </div>
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                  >
                  <Logo></Logo>
                    <span className="text-lg font-semibold tracking-tighter">
                    ফসল বাড়ি
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className=" p-4">
          
              <NavigationMenu >
            <NavigationMenuList className="flex flex-col  space-y-4">
         
              <NavigationMenuItem>
                <Link
                  href="/"
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
                    )}
                >
                 Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/about"
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/about'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
                    )}
                >
               About Us
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/projects"
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/projects'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
                    )}
                >
                  Projects
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                
                <Link
                  href="/Contact "
                  className={cn(
                    "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
                    pathName === '/contact'? "bg-primary/50 backdrop-blur-md":"bg-white/5"
                    )}
                >
             Contact Us
                </Link>
              </NavigationMenuItem>
              {
  user.data?.user.role ==="INVESTOR" && <NavigationMenuItem>
  <Link
    href="/dashboard/investor/user-overview"
    className={cn(
      "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
      pathName === '/dashboard/investor/user-overview'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
      )}
  >
Dashboard
  </Link>
</NavigationMenuItem>
 }
              {
  user.data?.user.role ==="ADMIN" && <NavigationMenuItem>
  <Link
    href="/dashboard/admin/overview"
    className={cn(
      "p-2 rounded-lg transition-colors hover:bg-gray-500/30",
      pathName === '/dashboard/admin/overview'? "bg-primary/20 backdrop-blur-md":"bg-white/5"
      )}
  >
Dashboard
  </Link>
</NavigationMenuItem>
 }
 <ModeToggle></ModeToggle>
 <NotificationBell></NotificationBell>
            </NavigationMenuList>
          </NavigationMenu>
                <div className="mt-6 flex flex-col gap-4">
                {
    user?.data?.user.phone ? (<div className="flex items-center gap-4">
 <div className="bg-primary flex items-center justify-center rounded-full w-12 h-12 text-white">{user.data.user.name?.slice(0,2).toUpperCase()}</div>
 <Button onClick={()=>signOut()} variant='ghost' className="flex items-center gap-2">Logout <LogOut></LogOut></Button>
    </div>):(<>
            <Link
          href={'/signin'}
          >
          <Button variant="outline">Sign in</Button>
          </Link>
            <Link
                href={'/register'}>
                <Button>Register</Button>
                </Link>
    </>)
  }
     
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};

export { Navbar5 };
