# 🎯 FULLSCREEN LACROSSE LAB MODAL ENHANCEMENT PROMPT

## 📋 TASK OVERVIEW
Enhance the `FullscreenDiagramModal` component to include full diagram navigation capabilities (arrows, dots, keyboard navigation) like the main `LacrosseLabModal`, and integrate it properly with the main modal.

## 🎯 SPECIFIC REQUIREMENTS

### 1. ENHANCE FullscreenDiagramModal Component
**File:** `src/components/practice-planner/modals/FullscreenDiagramModal.tsx`

#### Current Interface (CHANGE THIS):
```typescript
interface FullscreenDiagramModalProps {
  isOpen: boolean
  onClose: () => void
  diagramUrl: string
  title: string
}
```

#### New Interface (IMPLEMENT THIS):
```typescript
interface FullscreenDiagramModalProps {
  isOpen: boolean
  onClose: () => void
  labUrls: string[]           // All diagram URLs
  currentIndex: number        // Current diagram index
  drill: any                  // Drill object for title
}
```

### 2. IMPLEMENT NAVIGATION FEATURES

#### ✅ Add These Navigation Elements:
1. **Arrow Navigation** - Left/right arrows on sides of iframe
2. **Dot Navigation** - Dots below iframe for direct navigation
3. **Keyboard Navigation** - Arrow keys and Escape key support
4. **Badge Counter** - "X of Y" indicator in header
5. **Loading States** - Loading spinner during iframe loads

#### ✅ Copy Navigation Logic From Main Modal:
- `currentIndex` state management
- `handleNext()`, `handlePrevious()`, `handleDotClick()` functions
- `isLoading` state for iframe loading
- Keyboard event listeners (useEffect)

### 3. LAYOUT SPECIFICATIONS

#### ✅ Fullscreen Layout Structure:
```jsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full bg-white p-0 m-0">
    {/* Header with title and counter */}
    <DialogHeader className="p-6 border-b">
      <DialogTitle>
        <Beaker icon + drill title + "Lacrosse Lab Diagrams" />
      </DialogTitle>
      <DialogDescription>
        Badge: "X of Y diagrams"
      </DialogDescription>
    </DialogHeader>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
      {/* Iframe Container with Navigation */}
      <div className="relative flex-1 bg-white">
        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}
        
        {/* Iframe - Full height */}
        <iframe 
          src={getEmbedUrl(labUrls[currentIndex])}
          className="w-full h-full border-0"
          // ... other iframe props
        />
        
        {/* Navigation Arrows (only if multiple diagrams) */}
        {labUrls.length > 1 && (
          <>
            <button className="absolute left-4 top-1/2 -translate-y-1/2">
              <ChevronLeft />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronRight />
            </button>
          </>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="p-4 border-t bg-white">
        {/* Dots Navigation (only if multiple diagrams) */}
        {labUrls.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            {/* Dot buttons */}
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-center text-sm text-gray-600">
          <p>Use arrow keys, navigation arrows, or dots to navigate • Press Escape to close</p>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 4. UPDATE MAIN MODAL INTEGRATION

#### ✅ Modify LacrosseLabModal.tsx:
**Around line 312-317**, change the FullscreenDiagramModal props:

```typescript
// CHANGE FROM:
<FullscreenDiagramModal
  isOpen={showFullscreen}
  onClose={() => setShowFullscreen(false)}
  diagramUrl={getEmbedUrl(labUrls[currentIndex])}
  title={`${drill.title || drill.name} - Lacrosse Lab Diagram ${currentIndex + 1}`}
/>

// CHANGE TO:
<FullscreenDiagramModal
  isOpen={showFullscreen}
  onClose={() => setShowFullscreen(false)}
  labUrls={labUrls}
  currentIndex={currentIndex}
  drill={drill}
/>
```

### 5. REQUIRED IMPORTS

#### ✅ Add These Imports to FullscreenDiagramModal.tsx:
```typescript
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Beaker, Loader2 } from 'lucide-react'
```

### 6. HELPER FUNCTIONS TO INCLUDE

#### ✅ Copy These Functions from Main Modal:
```typescript
// URL processing function
const getEmbedUrl = (url: string): string => {
  // ... copy exact implementation from LacrosseLabModal
}

// Navigation handlers
const handleNext = () => {
  setCurrentIndex((prev) => (prev + 1) % labUrls.length)
  setIsLoading(true)
}

const handlePrevious = () => {
  setCurrentIndex((prev) => (prev - 1 + labUrls.length) % labUrls.length)
  setIsLoading(true)
}

const handleDotClick = (index: number) => {
  setCurrentIndex(index)
  setIsLoading(true)
}

// Iframe load handler
const handleIframeLoad = () => {
  setIsLoading(false)
}
```

### 7. KEYBOARD NAVIGATION

#### ✅ Add Keyboard Support:
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        handlePrevious()
        break
      case 'ArrowRight':
        event.preventDefault()
        handleNext()
        break
      case 'Escape':
        event.preventDefault()
        onClose()
        break
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isOpen, labUrls.length])
```

## 🎯 SUCCESS CRITERIA

### ✅ When Complete, The Fullscreen Modal Should:
1. **Show all diagrams** - Navigate through all drill diagrams, not just one
2. **Match main modal navigation** - Same arrow buttons, dots, keyboard support
3. **Display in true fullscreen** - Use full viewport height and width
4. **Show progress indicator** - "X of Y diagrams" badge
5. **Handle loading states** - Loading spinner during iframe loads
6. **Support keyboard navigation** - Arrow keys and Escape
7. **Maintain current position** - Open at same diagram user was viewing

### ✅ Testing Checklist:
- [ ] Fullscreen button in main modal opens enhanced fullscreen modal
- [ ] Arrow buttons navigate between diagrams
- [ ] Dot navigation works for direct access
- [ ] Keyboard arrows navigate diagrams
- [ ] Escape key closes modal
- [ ] Loading spinner shows during iframe loads
- [ ] Badge shows correct "X of Y" count
- [ ] Modal opens at correct current diagram
- [ ] Works with single diagram (no navigation shown)
- [ ] Works with multiple diagrams (navigation visible)

## 📝 IMPLEMENTATION NOTES

### 🚨 Important Requirements:
1. **Use existing patterns** - Copy navigation logic exactly from main modal
2. **Maintain state sync** - Fullscreen should reflect main modal's current position
3. **Handle edge cases** - Single diagram vs multiple diagrams
4. **Follow design system** - Use existing colors, spacing, components
5. **Test thoroughly** - Verify all navigation methods work

### 🎨 Design Consistency:
- Use same button styles as main modal
- Use same loading spinner design
- Use same color scheme (`text-[#003366]`, etc.)
- Use same spacing and typography patterns

---

**File to modify:** `src/components/practice-planner/modals/FullscreenDiagramModal.tsx`  
**File to update:** `src/components/practice-planner/modals/LacrosseLabModal.tsx` (integration)  
**Expected result:** Enhanced fullscreen modal with complete navigation capabilities
