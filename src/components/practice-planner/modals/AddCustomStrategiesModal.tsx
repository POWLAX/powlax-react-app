'use client'

import { toast } from 'sonner'

interface AddCustomStrategiesModalProps {
  isOpen: boolean
  onClose: () => void
  onStrategyCreated?: () => void
}

// DISABLED: Custom Strategy Creation Feature Removed
// This component is kept as a stub to prevent import errors
export default function AddCustomStrategiesModal({ 
  isOpen, 
  onClose, 
  onStrategyCreated 
}: AddCustomStrategiesModalProps) {
  // If somehow this modal is opened, immediately close it and show a message
  if (isOpen) {
    onClose()
    toast.info('Custom strategy creation has been disabled')
  }

  return null
}