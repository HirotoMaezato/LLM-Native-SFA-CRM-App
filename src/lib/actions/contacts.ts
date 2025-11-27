'use server'

import { createClient } from '@/lib/supabase/server'
import { Contact } from '@/types/contact'
import { revalidatePath } from 'next/cache'

// Helper function to transform database row to Contact type
function transformContactRow(row: any, accountName?: string): Contact {
  return {
    id: row.id,
    accountId: row.account_id,
    accountName: accountName,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    department: row.department,
    email: row.email,
    phone: row.phone,
    mobilePhone: row.mobile_phone,
    isPrimaryContact: row.is_primary_contact,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes,
  }
}

// Get all contacts
export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient()

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      *,
      accounts (
        name
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return contacts.map(contact => {
    const accountName = (contact.accounts as any)?.name
    return transformContactRow(contact, accountName)
  })
}

// Get contact by ID
export async function getContactById(id: string): Promise<Contact | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      accounts (
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching contact:', error)
    return null
  }

  const accountName = (data.accounts as any)?.name
  return transformContactRow(data, accountName)
}

// Get contacts by account ID
export async function getContactsByAccountId(accountId: string): Promise<Contact[]> {
  const supabase = await createClient()

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      *,
      accounts (
        name
      )
    `)
    .eq('account_id', accountId)
    .order('is_primary_contact', { ascending: false })
    .order('last_name')

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return contacts.map(contact => {
    const accountName = (contact.accounts as any)?.name
    return transformContactRow(contact, accountName)
  })
}

// Create new contact
export async function createContact(
  contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'accountName'>
): Promise<Contact | null> {
  const supabase = await createClient()

  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert({
      account_id: contact.accountId,
      first_name: contact.firstName,
      last_name: contact.lastName,
      title: contact.title,
      department: contact.department,
      email: contact.email,
      phone: contact.phone,
      mobile_phone: contact.mobilePhone,
      is_primary_contact: contact.isPrimaryContact,
      notes: contact.notes,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating contact:', error)
    return null
  }

  revalidatePath('/contacts')
  revalidatePath(`/accounts/${contact.accountId}`)
  return transformContactRow(newContact)
}

// Update contact
export async function updateContact(
  id: string,
  updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'accountName'>>
): Promise<Contact | null> {
  const supabase = await createClient()

  const { data: updatedContact, error } = await supabase
    .from('contacts')
    .update({
      account_id: updates.accountId,
      first_name: updates.firstName,
      last_name: updates.lastName,
      title: updates.title,
      department: updates.department,
      email: updates.email,
      phone: updates.phone,
      mobile_phone: updates.mobilePhone,
      is_primary_contact: updates.isPrimaryContact,
      notes: updates.notes,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating contact:', error)
    return null
  }

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  if (updates.accountId) {
    revalidatePath(`/accounts/${updates.accountId}`)
  }
  return transformContactRow(updatedContact)
}

// Delete contact
export async function deleteContact(id: string): Promise<boolean> {
  const supabase = await createClient()

  // Get contact to revalidate account page
  const { data: contact } = await supabase
    .from('contacts')
    .select('account_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('contacts').delete().eq('id', id)

  if (error) {
    console.error('Error deleting contact:', error)
    return false
  }

  revalidatePath('/contacts')
  if (contact) {
    revalidatePath(`/accounts/${contact.account_id}`)
  }
  return true
}
