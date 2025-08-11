'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Link, Beaker, Globe, AlertCircle } from 'lucide-react'

interface LinksModalProps {
  isOpen: boolean
  onClose: () => void
  drill: {
    title?: string
    name?: string
    custom_url?: string
    drill_lab_url_1?: string
    drill_lab_url_2?: string
    drill_lab_url_3?: string
    lacrosse_lab_urls?: string[]
  }
}

export default function LinksModal({ isOpen, onClose, drill }: LinksModalProps) {
  // Collect all available links
  const links = []

  // Add custom URL if available
  if (drill.custom_url) {
    links.push({
      url: drill.custom_url,
      title: 'Custom Link',
      type: 'custom',
      icon: Globe
    })
  }

  // Don't add Lacrosse Lab URLs here - they have their own modal
  // LinksModal is only for custom external links

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getLinkDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'External Link'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {drill.title || drill.name} - External Links
          </DialogTitle>
          <DialogDescription>
            Access additional resources and materials for this drill
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">No external links available for this drill</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => {
                const IconComponent = link.icon
                return (
                  <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-medium">{link.title}</h4>
                            <p className="text-sm text-gray-500">{getLinkDomain(link.url)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={link.type === 'lab' ? 'default' : 'secondary'}>
                            {link.type === 'lab' ? 'Lacrosse Lab' : 'External'}
                          </Badge>
                          <Button 
                            onClick={() => handleOpenLink(link.url)}
                            size="sm"
                            variant="outline"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {links.length > 0 && (
          <div className="flex justify-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Links will open in a new tab
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}