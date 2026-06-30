"use server";

import { createPost, updatePost, deletePost } from "@/services/posts";
import type { CreatePostInput, UpdatePostInput } from "@/services/posts";
import { revalidatePath } from "next/cache";

export async function createPostAction(input: CreatePostInput) {
  const post = await createPost(input);
  revalidatePath("/");
  revalidatePath("/admin");
  if (post.status === "published") {
    revalidatePath(`/${post.slug}`);
  }
  return post;
}

export async function updatePostAction(id: number, input: UpdatePostInput) {
  const post = await updatePost(id, input);
  if (!post) return null;
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/${post.slug}`);
  return post;
}

export async function deletePostAction(id: number) {
  await deletePost(id);
  revalidatePath("/");
  revalidatePath("/admin");
}
