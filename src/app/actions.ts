'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createPrompt(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const promptText = formData.get('prompt_text') as string
  const modelUsed = formData.get('model_used') as string
  const tagsString = formData.get('tags') as string
  const categoryId = formData.get('category_id') as string || null
  const imageFiles = formData.getAll('images') as File[]

  function generateTitle(text: string) {
    const segments = text.split(/[,.|\n]+/)
    let mainConcept = segments[0]?.trim() || "Untitled Prompt"
    
    if (mainConcept.length < 5 && segments.length > 1) {
      mainConcept += ` ${segments[1].trim()}`
    }

    mainConcept = mainConcept.charAt(0).toUpperCase() + mainConcept.slice(1)

    if (mainConcept.length > 45) {
      const truncated = mainConcept.substring(0, 45)
      const lastSpace = truncated.lastIndexOf(' ')
      if (lastSpace > 20) {
        mainConcept = truncated.substring(0, lastSpace) + '...'
      } else {
        mainConcept = truncated + '...'
      }
    }
    return mainConcept
  }

  const title = generateTitle(promptText)

  let demo_image_urls: string[] = []

  for (const imageFile of imageFiles) {
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 4 * 1024 * 1024) {
        return { error: `File ${imageFile.name} exceeds the 4MB limit.` }
      }
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('prompt-images')
        .upload(filePath, buffer, {
          contentType: imageFile.type,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { error: `Failed to upload image: ${uploadError.message || JSON.stringify(uploadError)}` }
      }
      demo_image_urls.push(filePath)
    }
  }

  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []

  const { error: insertError } = await supabase.from('prompts').insert({
    user_id: user.id,
    prompt_text: promptText,
    title,
    model_used: modelUsed,
    category_id: categoryId,
    tags,
    demo_image_urls
  })

  if (insertError) {
    return { error: insertError.message }
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  
  return { success: true }
}

export async function updatePrompt(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const promptText = formData.get('prompt_text') as string
  const modelUsed = formData.get('model_used') as string
  const tagsString = formData.get('tags') as string
  const categoryId = formData.get('category_id') as string || null

  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []

  const { error: updateError } = await supabase.from('prompts').update({
    prompt_text: promptText,
    model_used: modelUsed,
    category_id: categoryId,
    tags,
  }).eq('id', id).eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  return { success: true }
}

export async function deletePrompt(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('prompts').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  return { success: true }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const color = formData.get('color') as string || '#3b82f6'

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    color
  })

  if (error) return { error: error.message }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  return { success: true }
}

export async function createShareLink(promptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if a token already exists
  const { data: existingShare } = await supabase
    .from('shares')
    .select('share_token')
    .eq('prompt_id', promptId)
    .eq('shared_by', user.id)
    .single()

  if (existingShare?.share_token) {
    return { token: existingShare.share_token }
  }

  // Create new share token
  const token = crypto.randomUUID()
  const { error } = await supabase.from('shares').insert({
    prompt_id: promptId,
    shared_by: user.id,
    share_token: token
  })

  if (error) return { error: error.message }

  // Update prompt visibility if it was private
  await supabase.from('prompts').update({ visibility: 'shared' }).eq('id', promptId).eq('visibility', 'private')

  return { token }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  if (!name || !email) return { error: 'Name and email are required' }

  const { error } = await supabase.auth.updateUser({
    email: email,
    data: { display_name: name }
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters' }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) return { error: error.message }
  return { success: true }
}
