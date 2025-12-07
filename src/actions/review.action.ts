"use server"

import { getUserFromSession } from "@/helpers/getUserSession"
import { IReviewCreate } from "@/types/review"
import { toast } from "sonner"

import { revalidateTag } from "next/cache"



const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

 export const createNewReview = async(payload:IReviewCreate)=>{
const user = await getUserFromSession()
try {
    const reviewCreateInput = {
        ...payload,
        userId:user.id
    }
    const res = await fetch(`${baseApi}/review`,{
        method:"POST",
        headers: {
            'Content-Type': 'application/json',
          },
        body:JSON.stringify(reviewCreateInput)
    })
    const result =await res.json()
    if(res.ok){
        revalidateTag("review")
    }
return result

} catch (error:any) {
    console.log(error)
    toast.error(error.message || "comment not created")
}

}


export const getAllReview = async(projectId:number)=>{

    try {
        const res = await fetch(`${baseApi}/review/${projectId}`,{
            next:{
                tags:["review"]
            },
            cache:"no-store"
        })
        const result =await res.json()
        console.log(result)
      return result
    } catch (error:any) {
        console.log(error)
        toast.error(error.message || "something went wrong")
    }
}


export const deleteReview = async(reviewId:string,userId:number)=>{
    try {
        const res = await fetch(`${baseApi}/review/delete?reviewId=${reviewId}&userId=${userId}`,{
            method:"DELETE"
        })
        if(res.ok){
            revalidateTag("review")
        }
        return await res.json()
    } catch (error:any) {
        console.log(error)
        toast.error(error.message || "something went wrong")
    }
}