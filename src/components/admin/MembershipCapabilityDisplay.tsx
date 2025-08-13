/**
 * MembershipCapabilityDisplay Component
 * Shows user's membership status, capabilities, and entitlements
 * Contract: membership-capability-002.yaml
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  useMembershipCapabilities, 
  getCapabilityDisplayName,
  getProductTierColor
} from '@/hooks/useMembershipCapabilities'
import { getProductDisplayName } from '@/lib/membership/product-hierarchy'
import { 
  Crown, 
  Users, 
  Building, 
  User, 
  ChevronDown, 
  ChevronRight,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface MembershipCapabilityDisplayProps {
  userId: string
  showProducts?: boolean
  showCapabilities?: boolean
  showExpiration?: boolean
  showSources?: boolean
  compact?: boolean
}

export default function MembershipCapabilityDisplay({
  userId,
  showProducts = true,
  showCapabilities = true,
  showExpiration = false,
  showSources = false,
  compact = false
}: MembershipCapabilityDisplayProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [sourcesExpanded, setSourcesExpanded] = useState(false)
  
  const {
    capabilities,
    loading,
    error,
    hasAcademyAccess,
    hasFullAcademy,
    hasBasicAcademy,
    hasCoachAccess,
    hasTeamAccess,
    teamLimits
  } = useMembershipCapabilities(userId)

  if (loading) {
    return (
      <Card className={compact ? "p-2" : ""}>
        <CardContent className={compact ? "p-2" : ""}>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading membership...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={compact ? "p-2" : ""}>
        <CardContent className={compact ? "p-2" : ""}>
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load membership</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!capabilities) {
    return (
      <Card className={compact ? "p-2" : ""}>
        <CardContent className={compact ? "p-2" : ""}>
          <div className="flex items-center gap-2 text-gray-500">
            <User className="h-4 w-4" />
            <span className="text-sm">No membership data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const academyTierColor = getProductTierColor(capabilities.academyTier)

  // Compact view for user cards
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Academy Status */}
        {hasAcademyAccess && (
          <Badge className={`${academyTierColor} text-xs`}>
            {capabilities.academyTier === 'full' ? 'Full Academy' :
             capabilities.academyTier === 'basic' ? 'Basic Academy' : 'Limited Academy'}
          </Badge>
        )}

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-1">
          {hasCoachAccess && (
            <Badge variant="outline" className="text-xs">
              Coach
            </Badge>
          )}
          {hasTeamAccess && (
            <Badge variant="outline" className="text-xs">
              Team Mgmt
            </Badge>
          )}
          {teamLimits && (
            <Badge variant="outline" className="text-xs">
              Player ({teamLimits.position}/{teamLimits.playerLimit})
            </Badge>
          )}
        </div>

        {/* View Details Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDetailsOpen(true)}
          className="text-xs h-6 px-2"
        >
          <Info className="h-3 w-3 mr-1" />
          Details
        </Button>
      </div>
    )
  }

  // Full display view
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Membership Status
          </CardTitle>
          <CardDescription>
            Current entitlements and capabilities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Academy Access */}
          <div>
            <h4 className="font-medium mb-2">Academy Access</h4>
            {hasAcademyAccess ? (
              <Badge className={academyTierColor}>
                {capabilities.academyTier === 'full' ? 'Full Academy Access' :
                 capabilities.academyTier === 'basic' ? 'Basic Academy Access' : 'Limited Academy Access'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                No Academy Access
              </Badge>
            )}
          </div>

          {/* Products */}
          {showProducts && capabilities.products.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Active Products</h4>
              <div className="flex flex-wrap gap-2">
                {capabilities.products.map((productId) => (
                  <Badge key={productId} variant="secondary">
                    {getProductDisplayName(productId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {showCapabilities && capabilities.capabilities.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Capabilities</h4>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.capabilities.map((capability) => (
                  <div key={capability} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{getCapabilityDisplayName(capability)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Limits Info */}
          {teamLimits && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Team Player Status</span>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Team: {teamLimits.teamName}</div>
                <div>Position: {teamLimits.position} of {teamLimits.playerLimit}</div>
                <div className="flex items-center gap-2">
                  {teamLimits.isEligible ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Eligible for team benefits</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-700">Not eligible for team benefits (position {teamLimits.position})</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sources */}
          {showSources && capabilities.sources.length > 0 && (
            <Collapsible open={sourcesExpanded} onOpenChange={setSourcesExpanded}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                {sourcesExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Capability Sources ({capabilities.sources.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {capabilities.sources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    {source.type === 'direct' && <User className="h-4 w-4 text-blue-600" />}
                    {source.type === 'team' && <Users className="h-4 w-4 text-green-600" />}
                    {source.type === 'club' && <Building className="h-4 w-4 text-purple-600" />}
                    {source.type === 'parent' && <Crown className="h-4 w-4 text-orange-600" />}
                    
                    <div className="text-sm">
                      <div className="font-medium">{getProductDisplayName(source.productId)}</div>
                      <div className="text-gray-600">
                        via {source.type} {source.sourceName ? `(${source.sourceName})` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* No Access Warning */}
          {!hasAcademyAccess && !hasCoachAccess && !hasTeamAccess && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  This user has no active memberships or capabilities
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Membership Details</DialogTitle>
            <DialogDescription>
              Full breakdown of user capabilities and entitlements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {capabilities.capabilities.length}
                  </div>
                  <div className="text-sm text-gray-600">Capabilities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600">
                    {capabilities.products.length}
                  </div>
                  <div className="text-sm text-gray-600">Products</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {capabilities.sources.length}
                  </div>
                  <div className="text-sm text-gray-600">Sources</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academy Access</h3>
              <Badge className={`${academyTierColor} text-sm`}>
                {capabilities.academyTier === 'full' ? 'Full Academy Access' :
                 capabilities.academyTier === 'basic' ? 'Basic Academy Access' : 
                 capabilities.academyTier === 'limited' ? 'Limited Academy Access' : 'No Academy Access'}
              </Badge>
              
              <h3 className="text-lg font-semibold">All Capabilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.capabilities.map((capability) => (
                  <div key={capability} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{getCapabilityDisplayName(capability)}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold">Active Products</h3>
              <div className="space-y-2">
                {capabilities.products.map((productId) => (
                  <div key={productId} className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium">{getProductDisplayName(productId)}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Product ID: {productId}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold">Capability Sources</h3>
              <div className="space-y-2">
                {capabilities.sources.map((source, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      {source.type === 'direct' && <User className="h-4 w-4 text-blue-600" />}
                      {source.type === 'team' && <Users className="h-4 w-4 text-green-600" />}
                      {source.type === 'club' && <Building className="h-4 w-4 text-purple-600" />}
                      {source.type === 'parent' && <Crown className="h-4 w-4 text-orange-600" />}
                      <span className="font-medium capitalize">{source.type} Purchase</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Product: {getProductDisplayName(source.productId)}
                      {source.sourceName && (
                        <span> • Source: {source.sourceName}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {teamLimits && (
                <>
                  <h3 className="text-lg font-semibold">Team Status</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Team</div>
                        <div className="font-medium">{teamLimits.teamName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Position</div>
                        <div className="font-medium">{teamLimits.position} of {teamLimits.playerLimit}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Eligibility</div>
                        <div className={`font-medium ${teamLimits.isEligible ? 'text-green-600' : 'text-red-600'}`}>
                          {teamLimits.isEligible ? 'Eligible' : 'Not Eligible'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Available Slots</div>
                        <div className="font-medium">{teamLimits.availableSlots}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}