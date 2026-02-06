'use server'

import { createClient } from '@/lib/supabase/server'
import { Account, Tag } from '@/types/account'
import { revalidatePath } from 'next/cache'

// Helper function to transform database row to Account type
function transformAccountRow(row: any, tags: Tag[] = []): Account {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    region: row.region,
    phone: row.phone,
    email: row.email,
    website: row.website,
    representative: row.representative,
    employeeCount: row.employee_count,
    annualRevenue: row.annual_revenue,
    address: row.address,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: tags,
    description: row.description,
    notes: row.notes,
  }
}

// Get all accounts
export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select(`
      *,
      account_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }

  return accounts.map(account => {
    const tags = account.account_tags?.map((at: any) => at.tags).filter(Boolean) || []
    return transformAccountRow(account, tags)
  })
}

// Get account by ID
export async function getAccountById(id: string): Promise<Account | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('accounts')
    .select(`
      *,
      account_tags (
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
    console.error('Error fetching account:', error)
    return null
  }

  const tags = data.account_tags?.map((at: any) => at.tags).filter(Boolean) || []
  return transformAccountRow(data, tags)
}

// Create new account
export async function createAccount(
  account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Account | null> {
  const supabase = await createClient()

  const { data: newAccount, error: accountError } = await supabase
    .from('accounts')
    .insert({
      name: account.name,
      industry: account.industry,
      region: account.region,
      phone: account.phone,
      email: account.email,
      website: account.website,
      representative: account.representative,
      employee_count: account.employeeCount,
      annual_revenue: account.annualRevenue,
      address: account.address,
      status: account.status,
      description: account.description,
      notes: account.notes,
    })
    .select()
    .single()

  if (accountError) {
    console.error('Error creating account:', accountError)
    return null
  }

  // Insert tags if any
  if (account.tags && account.tags.length > 0) {
    const accountTags = account.tags.map(tag => ({
      account_id: newAccount.id,
      tag_id: tag.id,
    }))

    const { error: tagsError } = await supabase
      .from('account_tags')
      .insert(accountTags)

    if (tagsError) {
      console.error('Error adding tags to account:', tagsError)
    }
  }

  revalidatePath('/accounts')
  return transformAccountRow(newAccount, account.tags)
}

// Update account
export async function updateAccount(
  id: string,
  updates: Partial<Account>
): Promise<Account | null> {
  const supabase = await createClient()

  const { data: updatedAccount, error: accountError } = await supabase
    .from('accounts')
    .update({
      name: updates.name,
      industry: updates.industry,
      region: updates.region,
      phone: updates.phone,
      email: updates.email,
      website: updates.website,
      representative: updates.representative,
      employee_count: updates.employeeCount,
      annual_revenue: updates.annualRevenue,
      address: updates.address,
      status: updates.status,
      description: updates.description,
      notes: updates.notes,
    })
    .eq('id', id)
    .select()
    .single()

  if (accountError) {
    console.error('Error updating account:', accountError)
    return null
  }

  // Update tags if provided
  if (updates.tags !== undefined) {
    // Delete existing tags
    await supabase.from('account_tags').delete().eq('account_id', id)

    // Insert new tags
    if (updates.tags.length > 0) {
      const accountTags = updates.tags.map(tag => ({
        account_id: id,
        tag_id: tag.id,
      }))

      const { error: tagsError } = await supabase
        .from('account_tags')
        .insert(accountTags)

      if (tagsError) {
        console.error('Error updating tags:', tagsError)
      }
    }
  }

  revalidatePath('/accounts')
  revalidatePath(`/accounts/${id}`)
  return transformAccountRow(updatedAccount, updates.tags)
}

// Delete account
export async function deleteAccount(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('accounts').delete().eq('id', id)

  if (error) {
    console.error('Error deleting account:', error)
    return false
  }

  revalidatePath('/accounts')
  return true
}
