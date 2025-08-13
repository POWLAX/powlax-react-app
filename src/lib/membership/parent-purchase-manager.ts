/**
 * Parent Purchase Manager
 * Handles parent purchasing for children and family account management
 * Contract: membership-capability-002.yaml
 */

import { supabase } from '@/lib/supabase'
import { allProducts, individualProducts } from './product-hierarchy'

// Types
export interface ParentPurchase {
  id: string
  parentUserId: string
  childUserId: string
  productId: string
  purchaseDate: Date
  status: 'active' | 'cancelled' | 'expired'
  expiresAt?: Date
}

export interface FamilyAccount {
  id: string
  parentUserId: string
  children: ChildAccount[]
  totalPurchases: number
  activeProducts: string[]
}

export interface ChildAccount {
  userId: string
  displayName?: string
  email?: string
  relationshipType: 'son' | 'daughter' | 'child'
  parentPurchases: ParentPurchase[]
  effectiveProducts: string[]
}

export interface PurchaseValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ParentPurchaseManager {
  /**
   * Validate parent-child relationship exists
   */
  async validateRelationship(parentUserId: string, childUserId: string): Promise<boolean> {
    const { data } = await supabase
      .from('parent_child_relationships')
      .select('id')
      .eq('parent_user_id', parentUserId)
      .eq('child_user_id', childUserId)
      .limit(1)

    return !!data && data.length > 0
  }

  /**
   * Get family account with all children and purchases
   */
  async getFamilyAccount(parentUserId: string): Promise<FamilyAccount | null> {
    // Get parent-child relationships
    const { data: relationships } = await supabase
      .from('parent_child_relationships')
      .select(`
        *,
        child_user:users!parent_child_relationships_child_user_id_fkey (
          id,
          display_name,
          email
        )
      `)
      .eq('parent_user_id', parentUserId)

    if (!relationships) return null

    // Get all parent purchases for children
    const childUserIds = relationships.map(r => r.child_user_id)
    const parentPurchases = await this.getParentPurchases(parentUserId, childUserIds)

    // Build child accounts with their purchases
    const children: ChildAccount[] = []
    for (const relationship of relationships) {
      const childUser = relationship.child_user
      if (!childUser) continue

      const childPurchases = parentPurchases.filter(p => p.childUserId === childUser.id)
      const effectiveProducts = childPurchases
        .filter(p => p.status === 'active')
        .map(p => p.productId)

      children.push({
        userId: childUser.id,
        displayName: childUser.display_name,
        email: childUser.email,
        relationshipType: relationship.relationship_type as 'son' | 'daughter' | 'child',
        parentPurchases: childPurchases,
        effectiveProducts
      })
    }

    // Get parent's own active products
    const { data: parentEntitlements } = await supabase
      .from('membership_entitlements')
      .select('product_name')
      .eq('user_id', parentUserId)
      .eq('status', 'active')

    const activeProducts = parentEntitlements?.map(e => e.product_name) || []

    return {
      id: parentUserId,
      parentUserId,
      children,
      totalPurchases: parentPurchases.length,
      activeProducts
    }
  }

  /**
   * Validate a potential parent purchase
   */
  async validatePurchase(
    parentUserId: string,
    childUserId: string,
    productId: string
  ): Promise<PurchaseValidation> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if relationship exists
    const relationshipExists = await this.validateRelationship(parentUserId, childUserId)
    if (!relationshipExists) {
      errors.push('Parent-child relationship not found')
    }

    // Check if product exists and is purchasable for children
    const product = allProducts[productId]
    if (!product) {
      errors.push('Product not found')
    } else if (!this.isChildPurchasableProduct(productId)) {
      errors.push('This product cannot be purchased for children')
    }

    // Check if child already has this product
    const { data: existingEntitlement } = await supabase
      .from('membership_entitlements')
      .select('id, status')
      .eq('user_id', childUserId)
      .eq('product_name', productId)
      .limit(1)

    if (existingEntitlement && existingEntitlement.length > 0) {
      const entitlement = existingEntitlement[0]
      if (entitlement.status === 'active') {
        warnings.push('Child already has this product active')
      } else {
        warnings.push('Child previously had this product (reactivating)')
      }
    }

    // Check if parent has purchasing capability
    const parentCapable = await this.canParentPurchase(parentUserId)
    if (!parentCapable) {
      errors.push('Parent account not eligible for child purchases')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Process a parent purchase for a child
   */
  async processPurchase(purchase: Omit<ParentPurchase, 'id'>): Promise<{
    success: boolean
    purchaseId?: string
    error?: string
  }> {
    try {
      // Validate the purchase first
      const validation = await this.validatePurchase(
        purchase.parentUserId,
        purchase.childUserId,
        purchase.productId
      )

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        }
      }

      // Create or update the child's entitlement
      const entitlementData = {
        user_id: purchase.childUserId,
        product_name: purchase.productId,
        status: 'active',
        purchased_by: purchase.parentUserId,
        expires_at: purchase.expiresAt?.toISOString(),
        created_at: purchase.purchaseDate.toISOString()
      }

      const { data, error } = await supabase
        .from('membership_entitlements')
        .upsert(entitlementData, {
          onConflict: 'user_id,product_name'
        })
        .select('id')

      if (error) {
        console.error('Error creating entitlement:', error)
        return {
          success: false,
          error: 'Failed to create membership entitlement'
        }
      }

      // Log the purchase transaction
      await this.logPurchaseTransaction({
        parent_user_id: purchase.parentUserId,
        child_user_id: purchase.childUserId,
        product_id: purchase.productId,
        status: purchase.status,
        purchase_date: purchase.purchaseDate.toISOString(),
        expires_at: purchase.expiresAt?.toISOString()
      })

      return {
        success: true,
        purchaseId: data?.[0]?.id
      }
    } catch (error) {
      console.error('Error processing parent purchase:', error)
      return {
        success: false,
        error: 'Failed to process purchase'
      }
    }
  }

  /**
   * Cancel a parent purchase
   */
  async cancelPurchase(parentUserId: string, childUserId: string, productId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Update the entitlement status
      const { error } = await supabase
        .from('membership_entitlements')
        .update({ status: 'cancelled' })
        .eq('user_id', childUserId)
        .eq('product_name', productId)
        .eq('purchased_by', parentUserId)

      if (error) {
        console.error('Error cancelling purchase:', error)
        return {
          success: false,
          error: 'Failed to cancel purchase'
        }
      }

      // Log the cancellation
      await this.logPurchaseTransaction({
        parent_user_id: parentUserId,
        child_user_id: childUserId,
        product_id: productId,
        status: 'cancelled',
        purchase_date: new Date().toISOString()
      })

      return { success: true }
    } catch (error) {
      console.error('Error cancelling parent purchase:', error)
      return {
        success: false,
        error: 'Failed to cancel purchase'
      }
    }
  }

  /**
   * Get all parent purchases for specific children
   */
  private async getParentPurchases(
    parentUserId: string,
    childUserIds: string[]
  ): Promise<ParentPurchase[]> {
    if (childUserIds.length === 0) return []

    const { data } = await supabase
      .from('membership_entitlements')
      .select('*')
      .eq('purchased_by', parentUserId)
      .in('user_id', childUserIds)

    if (!data) return []

    return data.map(entitlement => ({
      id: entitlement.id,
      parentUserId,
      childUserId: entitlement.user_id,
      productId: entitlement.product_name,
      purchaseDate: new Date(entitlement.created_at),
      status: entitlement.status as 'active' | 'cancelled' | 'expired',
      expiresAt: entitlement.expires_at ? new Date(entitlement.expires_at) : undefined
    }))
  }

  /**
   * Check if a product can be purchased for children
   */
  private isChildPurchasableProduct(productId: string): boolean {
    // Only individual academy products can be purchased for children
    return productId.startsWith('skills_academy')
  }

  /**
   * Check if parent can make child purchases
   */
  private async canParentPurchase(parentUserId: string): Promise<boolean> {
    // Check if parent has any active membership or is in good standing
    const { data } = await supabase
      .from('membership_entitlements')
      .select('id')
      .eq('user_id', parentUserId)
      .eq('status', 'active')
      .limit(1)

    return !!data && data.length > 0
  }

  /**
   * Log purchase transaction for audit trail
   */
  private async logPurchaseTransaction(transaction: {
    parent_user_id: string
    child_user_id: string
    product_id: string
    status: string
    purchase_date: string
    expires_at?: string
  }) {
    // This would typically go to a purchase_transactions table
    // For now, we'll log to a generic activity table if it exists
    try {
      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: transaction.parent_user_id,
          activity_type: 'parent_purchase',
          activity_data: transaction,
          created_at: transaction.purchase_date
        })

      if (error) {
        console.warn('Failed to log purchase transaction:', error)
      }
    } catch (error) {
      console.warn('Failed to log purchase transaction:', error)
    }
  }

  /**
   * Get purchase history for a family account
   */
  async getPurchaseHistory(parentUserId: string): Promise<ParentPurchase[]> {
    const { data: relationships } = await supabase
      .from('parent_child_relationships')
      .select('child_user_id')
      .eq('parent_user_id', parentUserId)

    if (!relationships) return []

    const childUserIds = relationships.map(r => r.child_user_id)
    return this.getParentPurchases(parentUserId, childUserIds)
  }

  /**
   * Get children who could benefit from academy access
   */
  async getEligibleChildren(parentUserId: string): Promise<ChildAccount[]> {
    const familyAccount = await this.getFamilyAccount(parentUserId)
    if (!familyAccount) return []

    // Filter children who don't have full academy access
    return familyAccount.children.filter(child => {
      const hasFullAcademy = child.effectiveProducts.some(productId =>
        ['skills_academy_monthly', 'skills_academy_annual'].includes(productId)
      )
      return !hasFullAcademy
    })
  }

  /**
   * Bulk purchase for multiple children
   */
  async bulkPurchase(
    parentUserId: string,
    childUserIds: string[],
    productId: string
  ): Promise<{
    successful: string[]
    failed: Array<{ childUserId: string; error: string }>
  }> {
    const successful: string[] = []
    const failed: Array<{ childUserId: string; error: string }> = []

    for (const childUserId of childUserIds) {
      const result = await this.processPurchase({
        parentUserId,
        childUserId,
        productId,
        purchaseDate: new Date(),
        status: 'active'
      })

      if (result.success) {
        successful.push(childUserId)
      } else {
        failed.push({
          childUserId,
          error: result.error || 'Unknown error'
        })
      }
    }

    return { successful, failed }
  }
}

// Export singleton instance
export const parentPurchaseManager = new ParentPurchaseManager()

// Convenience functions
export async function getFamilyAccount(parentUserId: string) {
  return parentPurchaseManager.getFamilyAccount(parentUserId)
}

export async function validateParentPurchase(
  parentUserId: string,
  childUserId: string,
  productId: string
) {
  return parentPurchaseManager.validatePurchase(parentUserId, childUserId, productId)
}

export async function processParentPurchase(purchase: Omit<ParentPurchase, 'id'>) {
  return parentPurchaseManager.processPurchase(purchase)
}