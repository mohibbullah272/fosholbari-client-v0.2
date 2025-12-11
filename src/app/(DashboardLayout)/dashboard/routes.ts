// src/app/dashboard/routes.ts
import { authOptions } from "@/helpers/authOption"
import { getServerSession } from "next-auth"


export async function getDashboardRoutes() {
  const session = await getServerSession(authOptions)

  const role = session?.user.role || "guest"

  switch (role) {
    case "ADMIN":
      return {
        navMain: [
          {
            title: "অ্যাডমিন কন্ট্রোল",
            url: "#",
            items: [
              { title: "ড্যাশবোর্ড ওভারভিউ", url: "/dashboard/admin/overview" },
              { title: "নতুন প্রকল্প যোগ করুন", url: "/dashboard/admin/add-projects" },
              { title: "প্রকল্প সংশোধন করুন", url: "/dashboard/admin/update-project" },
              { title: "প্রকল্পের অগ্রগতি আপডেট করুন", url: "/dashboard/admin/update-project-progress" },
              { title: "পেমেন্ট পদ্ধতি যোগ করুন", url: "/dashboard/admin/add-payment-method" },
              { title: "পেমেন্ট পদ্ধতি আপডেট করুন", url: "/dashboard/admin/update-payment-method" },
              { title: "ইউজারদের পেমেন্ট গুলু দেখুন", url: "/dashboard/admin/all-payments" }, 
              { title: "বিনিয়োগকারীদের বার্তা", url: "/dashboard/Conversation" },
              { title: "প্রজ্ঞাপন", url: "/dashboard/admin/notification" },
            ],
          },
        ],
      }

    case "INVESTOR":
      return {
        navMain: [
          {
            title: "বিনিয়োগকারী ড্যাশবোর্ড",
            url: "#",
            items: [
              { title: "ড্যাশবোর্ড ওভারভিউ", url: "/dashboard/investor/user-overview" },
              { title: "আপনার প্রকল্পের অগ্রগতি দেখুন", url: "/dashboard/investor/my-project-progress" },
              { title: "আপনার বিনিয়োগ", url: "/dashboard/investor/my-investment" },
              { title: "KYC ভেরিফিকেশন করুন", url: "/dashboard/investor/kyc-verification" },
              { title: "আপনার প্রোফাইল", url: "/dashboard/investor/my-profile" },
              { title: "হেল্পলাইন", url: "/dashboard/Conversation" },
            ],
          },
        ],
      }

    default:
      return {
        navMain: [
          {
            title: "Getting Started",
            url: "#",
            items: [
              { title: "Installation", url: "#" },
              { title: "Project Structure", url: "#" },
            ],
          },
        ],
      }
  }
}
