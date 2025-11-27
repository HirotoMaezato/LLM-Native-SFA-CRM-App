'use server'

import { createClient } from '@/lib/supabase/server'
import { Deal, Tag } from '@/types/deal'
import { revalidatePath } from 'next/cache'

// Helper function to transform database row to Deal type
function transformDealRow(row: any, tags: Tag[] = []): Deal {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    contactPerson: row.contact_person,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    amount: row.amount,
    status: row.status,
    priority: row.priority,
    probability: row.probability,
    expectedCloseDate: row.expected_close_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: tags,
    description: row.description,
    area: row.area,
    product: row.product,
    team: row.team,
    notes: row.notes,
  }
}

// Get all deals
export async function getDeals(): Promise<Deal[]> {
  const supabase = await createClient()

  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      deal_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching deals:', error)
    return []
  }

  return deals.map(deal => {
    const tags = deal.deal_tags?.map((dt: any) => dt.tags).filter(Boolean) || []
    return transformDealRow(deal, tags)
  })
}

// Get deal by ID
export async function getDealById(id: string): Promise<Deal | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      deal_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching deal:', error)
    return null
  }

  const tags = data.deal_tags?.map((dt: any) => dt.tags).filter(Boolean) || []
  return transformDealRow(data, tags)
}

// Create new deal
export async function createDeal(
  deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Deal | null> {
  const supabase = await createClient()

  // Insert deal
  const { data: newDeal, error: dealError } = await supabase
    .from('deals')
    .insert({
      title: deal.title,
      company: deal.company,
      contact_person: deal.contactPerson,
      contact_email: deal.contactEmail,
      contact_phone: deal.contactPhone,
      amount: deal.amount,
      status: deal.status,
      priority: deal.priority,
      probability: deal.probability,
      expected_close_date: deal.expectedCloseDate,
      description: deal.description,
      area: deal.area,
      product: deal.product,
      team: deal.team,
      notes: deal.notes,
    })
    .select()
    .single()

  if (dealError) {
    console.error('Error creating deal:', dealError)
    return null
  }

  // Insert tags if any
  if (deal.tags && deal.tags.length > 0) {
    const dealTags = deal.tags.map(tag => ({
      deal_id: newDeal.id,
      tag_id: tag.id,
    }))

    const { error: tagsError } = await supabase
      .from('deal_tags')
      .insert(dealTags)

    if (tagsError) {
      console.error('Error adding tags to deal:', tagsError)
    }
  }

  revalidatePath('/deals')
  return transformDealRow(newDeal, deal.tags)
}

// Update deal
export async function updateDeal(
  id: string,
  updates: Partial<Deal>
): Promise<Deal | null> {
  const supabase = await createClient()

  // Update deal
  const { data: updatedDeal, error: dealError } = await supabase
    .from('deals')
    .update({
      title: updates.title,
      company: updates.company,
      contact_person: updates.contactPerson,
      contact_email: updates.contactEmail,
      contact_phone: updates.contactPhone,
      amount: updates.amount,
      status: updates.status,
      priority: updates.priority,
      probability: updates.probability,
      expected_close_date: updates.expectedCloseDate,
      description: updates.description,
      area: updates.area,
      product: updates.product,
      team: updates.team,
      notes: updates.notes,
    })
    .eq('id', id)
    .select()
    .single()

  if (dealError) {
    console.error('Error updating deal:', dealError)
    return null
  }

  // Update tags if provided
  if (updates.tags !== undefined) {
    // Delete existing tags
    await supabase.from('deal_tags').delete().eq('deal_id', id)

    // Insert new tags
    if (updates.tags.length > 0) {
      const dealTags = updates.tags.map(tag => ({
        deal_id: id,
        tag_id: tag.id,
      }))

      const { error: tagsError } = await supabase
        .from('deal_tags')
        .insert(dealTags)

      if (tagsError) {
        console.error('Error updating tags:', tagsError)
      }
    }
  }

  revalidatePath('/deals')
  revalidatePath(`/deals/${id}`)
  return transformDealRow(updatedDeal, updates.tags)
}

// Delete deal
export async function deleteDeal(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('deals').delete().eq('id', id)

  if (error) {
    console.error('Error deleting deal:', error)
    return false
  }

  revalidatePath('/deals')
  return true
}

// Get all tags
export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data
}

// Create new tag
export async function createTag(name: string, color: string): Promise<Tag | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .insert({ name, color })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return null
  }

  revalidatePath('/deals')
  return data
}
