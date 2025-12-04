"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "./authOption";

export async function getUserFromSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    return {
      id: parseInt(session.user.id),
      role: session?.user.role,
      status: session?.user.status,
    };
  }
  