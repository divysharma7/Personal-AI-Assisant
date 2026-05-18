/**
 * Stub — the original addComment module was lost.
 * Provides a generic comment-adding helper for any Mongoose model.
 */
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import type { Model } from 'mongoose'

export async function addComment(
  model: Model<any>,
  id: string,
  text: string
) {
  if (!text?.trim()) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
  }
  await connectDB()
  const doc = await model.findByIdAndUpdate(
    id,
    { $push: { comments: { text: text.trim(), createdAt: new Date() } } },
    { new: true }
  ).lean()
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(doc)
}
