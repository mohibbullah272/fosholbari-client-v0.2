// components/review/CommentSection.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Trash2,  AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { IReview, IReviewCreate } from '@/types/review'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { createNewReview, deleteReview, getAllReview } from '@/actions/review.action'
import { formatDate } from '@/helpers/formatDate'

interface CommentSectionProps {
  projectId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({ projectId }) => {
  const { data: session } = useSession()
  const [comments, setComments] = useState<IReview[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [projectId])

  const fetchComments = async () => {
    try {
      setFetching(true)
      const result = await getAllReview(projectId)
      if (result?.data) {
        setComments(result.data)
      }
    } catch (error) {
      toast.error('মন্তব্যগুলো লোড করতে সমস্যা হয়েছে')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      toast.warning('মন্তব্য লিখুন')
      return
    }

    if (!session?.user?.id) {
      toast.error('মন্তব্য করতে লগইন করুন')
      return
    }

    setLoading(true)
    try {
      const payload: IReviewCreate = {
        comment: newComment,
        projectId
      }

      const result = await createNewReview(payload)
      
      if (result?.success) {
        toast.success('মন্তব্য সফলভাবে যোগ হয়েছে')
        setNewComment('')
        fetchComments() // Refetch comments
      } else {
        toast.error(result?.message || 'মন্তব্য যোগ করতে সমস্যা হয়েছে')
      }
    } catch (error: any) {
      toast.error(error.message || 'মন্তব্য যোগ করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async () => {
    if (!deleteDialog || !session?.user?.id) return

    try {
      const result = await deleteReview(deleteDialog, parseInt(session.user.id))
      
      if (result?.success) {
        toast.success('মন্তব্য সফলভাবে মুছে ফেলা হয়েছে')
        setComments(comments.filter(comment => comment.id !== deleteDialog))
      } else {
        toast.error(result?.message || 'মন্তব্য মুছতে সমস্যা হয়েছে')
      }
    } catch (error: any) {
      toast.error(error.message || 'মন্তব্য মুছতে সমস্যা হয়েছে')
    } finally {
      setDeleteDialog(null)
    }
  }

  const canDeleteComment = (comment: IReview) => {
    if (!session?.user?.id) return false
    const userId = parseInt(session.user.id)
    
    // User can delete their own comment
    if (comment.userId === userId) return true
    
    // Admin check (you might need to get role from session)
    // For now, we'll check if user is admin based on some logic
    // You should implement proper role check
    const isAdmin = session?.user?.role === 'ADMIN'
    return isAdmin
  }

  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }



  return (
    <div className="mt-12">
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>💬</span>
            মন্তব্য সমূহ
            <Badge variant="secondary" className="ml-2">
              {comments.length} টি মন্তব্য
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Add Comment Form */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
           
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {session?.user?.name ? getInitials(session.user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <form onSubmit={handleSubmitComment}>
                  <Textarea
                    placeholder={session?.user ? "আপনার মূল্যবান মন্তব্য লিখুন..." : "মন্তব্য করতে লগইন করুন"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!session?.user || loading}
                    className="min-h-[100px] bg-background border-border resize-none"
                  />
                  
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-muted-foreground">
                      {session?.user ? "আপনার মন্তব্য সকলের জন্য দৃশ্যমান হবে" : "মন্তব্য করতে সাইন ইন করুন"}
                    </p>
                    <Button
                      type="submit"
                      disabled={!session?.user || loading || !newComment.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          মন্তব্য করুন
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">মন্তব্যগুলো লোড হচ্ছে...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  এখনও কোন মন্তব্য নেই
                </h3>
                <p className="text-muted-foreground">
                  প্রথম মন্তব্যকারী হন এবং আপনার মতামত শেয়ার করুন
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-border rounded-lg p-5 bg-background/50 hover:bg-accent/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarImage src={comment.user.photo || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(comment.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {comment.user.name || 'নামহীন ব্যবহারকারী'}
                          </h4>
                          {comment.userId === parseInt(session?.user?.id || '0') && (
                            <Badge variant="outline" className="text-xs py-0">
                              আপনি
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(comment.createdAt || new Date().toISOString())}
                        </p>
                        
                        <p className="text-foreground leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    {canDeleteComment(comment) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog(comment.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              মন্তব্য মুছে ফেলবেন?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              আপনি এই মন্তব্য স্থায়ীভাবে মুছে ফেলতে চলেছেন। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80">
              বাতিল করুন
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CommentSection