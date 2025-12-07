export interface IReview {
    user: {
        name: string | null;
        photo?: string | null;
    }
id:string;
comment:string;
userId : number
projectId :number
createdAt:string
} 

export interface IReviewCreate {
comment:string
userId?:number
projectId:number
}