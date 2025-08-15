'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface MembershipData {
  entitlements: any[]
  products: any[]
  capabilities: string[]
  expiration?: string
}

interface MembershipTabProps {
  userData: MembershipData
  onFieldChange: (tab: string, field: string, oldValue: any, newValue: any) => void
}

export default function MembershipTab({ userData, onFieldChange }: MembershipTabProps) {
  const [showAddMembership, setShowAddMembership] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  const getStatusIcon = (entitlement: any) => {
    const now = new Date()
    const expiry = entitlement.expires_at ? new Date(entitlement.expires_at) : null
    
    if (!entitlement.is_active) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (expiry && expiry < now) {
      return <Clock className="h-4 w-4 text-orange-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = (entitlement: any) => {
    const now = new Date()
    const expiry = entitlement.expires_at ? new Date(entitlement.expires_at) : null
    
    if (!entitlement.is_active) return 'Inactive'
    if (expiry && expiry < now) return 'Expired'
    return 'Active'
  }

  const getStatusBadge = (entitlement: any) => {
    const status = getStatusText(entitlement)
    
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'Expired':
        return <Badge className="bg-orange-100 text-orange-800">Expired</Badge>
      case 'Inactive':
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCapability = (capability: string) => {
    return capability
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleAddMembership = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    const product = userData.products.find(p => p.id === selectedProduct)
    if (!product) {
      toast.error('Product not found')
      return
    }

    const newEntitlement = {
      id: `ent_${Date.now()}`,
      user_id: 'current_user', // Will be set properly in implementation
      product_id: selectedProduct,
      product_name: product.name,
      is_active: true,
      granted_at: new Date().toISOString(),
      expires_at: expirationDate || null,
      capabilities: product.capabilities || [],
      created_at: new Date().toISOString()
    }

    const updatedEntitlements = [...userData.entitlements, newEntitlement]
    onFieldChange('membership', 'entitlements', userData.entitlements, updatedEntitlements)
    
    toast.success('Membership added successfully')
    setShowAddMembership(false)
    setSelectedProduct('')
    setExpirationDate('')
  }

  const handleRemoveMembership = async (entitlementId: string) => {
    const updatedEntitlements = userData.entitlements.filter(e => e.id !== entitlementId)
    onFieldChange('membership', 'entitlements', userData.entitlements, updatedEntitlements)
    toast.success('Membership removed successfully')
  }

  const handleToggleStatus = async (entitlementId: string) => {
    const updatedEntitlements = userData.entitlements.map(e => 
      e.id === entitlementId 
        ? { ...e, is_active: !e.is_active }
        : e
    )
    onFieldChange('membership', 'entitlements', userData.entitlements, updatedEntitlements)
    toast.success('Membership status updated')
  }

  const handleExtendMembership = async (entitlementId: string, newExpiry: string) => {
    const updatedEntitlements = userData.entitlements.map(e => 
      e.id === entitlementId 
        ? { ...e, expires_at: newExpiry }
        : e
    )
    onFieldChange('membership', 'entitlements', userData.entitlements, updatedEntitlements)
    toast.success('Membership extended successfully')
  }

  const getAvailableProducts = () => {
    return userData.products.filter(product => 
      !userData.entitlements.some(ent => ent.product_id === product.id && ent.is_active)
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Active Memberships ({userData.entitlements.filter(e => e.is_active).length})
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddMembership(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Membership
            </Button>
          </CardTitle>
          <CardDescription>
            User's current membership products and entitlements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.entitlements.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No memberships assigned
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.entitlements.map((entitlement) => (
                  <TableRow key={entitlement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(entitlement)}
                        <div>
                          <div className="font-medium">{entitlement.product_name}</div>
                          <div className="text-sm text-gray-500">
                            {entitlement.capabilities?.length || 0} capabilities
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entitlement)}
                    </TableCell>
                    <TableCell>
                      {entitlement.granted_at 
                        ? new Date(entitlement.granted_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      {entitlement.expires_at 
                        ? new Date(entitlement.expires_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(entitlement.id)}
                        >
                          {entitlement.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`This will permanently remove the ${entitlement.product_name} membership from this user. Continue?`)) {
                              handleRemoveMembership(entitlement.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add Membership Form */}
          {showAddMembership && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add New Membership</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableProducts().map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiration">Expiration Date (optional)</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddMembership} size="sm">
                    Add Membership
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddMembership(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Capabilities
          </CardTitle>
          <CardDescription>
            Aggregated capabilities from all active memberships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.capabilities.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No capabilities assigned
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userData.capabilities.map((capability, index) => (
                <Badge key={index} variant="secondary">
                  {formatCapability(capability)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Products */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products</CardTitle>
          <CardDescription>
            All membership products that can be assigned to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.products.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No products available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.products.map((product) => {
                const isAssigned = userData.entitlements.some(
                  ent => ent.product_id === product.id && ent.is_active
                )
                
                return (
                  <div key={product.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description || 'No description available'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.capabilities?.map((cap: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {formatCapability(cap)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ml-2">
                        {isAssigned ? (
                          <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}