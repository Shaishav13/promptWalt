'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function createPrompt(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const promptText = formData.get('prompt_text') as string
  const modelUsed = formData.get('model_used') as string
  const tagsString = formData.get('tags') as string
  const categoryId = formData.get('category_id') as string || null
  const imagePaths = formData.getAll('image_paths') as string[]

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

  const demo_image_urls = imagePaths

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

  // 1. Fetch current prompt to check if text changed
  const { data: currentPrompt } = await supabase
    .from('prompts')
    .select('prompt_text')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (currentPrompt && currentPrompt.prompt_text !== promptText) {
    // 2. Save the old version to history
    await supabase.from('prompt_versions').insert({
      prompt_id: id,
      prompt_text: currentPrompt.prompt_text
    })
  }

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

export async function createShareLink(promptId: string, includeImages: boolean = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if a token with the requested preference already exists
  const { data: existingShares } = await supabase
    .from('shares')
    .select('share_token')
    .eq('prompt_id', promptId)
    .eq('shared_by', user.id)

  if (existingShares) {
    const match = existingShares.find(s => includeImages ? !s.share_token.endsWith('-noimg') : s.share_token.endsWith('-noimg'))
    if (match) {
      return { token: match.share_token }
    }
  }

  // Create new share token
  const token = crypto.randomUUID() + (includeImages ? '' : '-noimg')
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

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('prompts').update({
    is_favorite: isFavorite
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  return { success: true }
}

export async function cloneSharedPrompt(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: shareData, error: shareError } = await supabase
    .from('shares')
    .select('prompt_id')
    .eq('share_token', token)
    .single()

  if (shareError || !shareData) return { error: 'Share link not found' }

  const { data: originalPrompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', shareData.prompt_id)
    .single()

  if (promptError || !originalPrompt) return { error: 'Original prompt not found' }

  const { error: insertError } = await supabase.from('prompts').insert({
    user_id: user.id,
    prompt_text: originalPrompt.prompt_text,
    title: `Copy of ${originalPrompt.title || 'Untitled'}`,
    model_used: originalPrompt.model_used,
    tags: originalPrompt.tags,
    demo_image_urls: originalPrompt.demo_image_urls,
    visibility: 'private'
  })

  if (insertError) return { error: insertError.message }

  redirect('/')
}

export async function bulkInsertPrompts(prompts: { prompt_text: string, title: string, model_used?: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const formattedPrompts = prompts.map(p => ({
    user_id: user.id,
    prompt_text: p.prompt_text,
    title: p.title || 'Imported Prompt',
    model_used: p.model_used || 'ChatGPT',
    visibility: 'private',
    tags: ['Imported']
  }))

  const { error } = await supabase.from('prompts').insert(formattedPrompts)
  
  if (error) return { error: error.message }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/')
  return { success: true }
}

export async function getPromptVersions(promptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('prompt_versions')
    .select('id, prompt_text, created_at')
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { versions: data }
}

export async function logPromptUsage(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: prompt } = await supabase.from('prompts').select('usage_count').eq('id', id).eq('user_id', user.id).single()
  if (!prompt) return { error: 'Not found' }

  const newCount = (prompt.usage_count || 0) + 1
  const { error } = await supabase.from('prompts').update({
    usage_count: newCount,
    last_used_at: new Date().toISOString()
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true, usage_count: newCount }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const password = formData.get('password') as string
  if (!password) return { error: 'Password is required' }

  // Verify password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password
  })

  if (signInError) {
    return { error: 'Incorrect password' }
  }

  // Delete the account using the RPC
  const { error: deleteError } = await supabase.rpc('delete_user')
  
  if (deleteError) return { error: deleteError.message }

  // Logout
  await supabase.auth.signOut()

  return { success: true }
}
