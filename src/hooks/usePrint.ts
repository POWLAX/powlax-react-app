'use client'

import { useState, useCallback } from 'react'

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)

  const printContent = useCallback((contentId?: string) => {
    setIsPrinting(true)

    try {
      // If specific content ID is provided, print only that section
      if (contentId) {
        const element = document.getElementById(contentId)
        if (!element) {
          console.error('Element not found for printing:', contentId)
          return
        }

        // Create a new window with the specific content
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (!printWindow) {
          console.error('Unable to open print window')
          return
        }

        // Get the current page's CSS
        const stylesheets = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n')
            } catch (e) {
              // Handle cross-origin CSS
              return ''
            }
          })
          .join('\n')

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>POWLAX Practice Plan</title>
              <style>
                ${stylesheets}
                
                /* Print-specific styles */
                @media print {
                  @page {
                    margin: 0.5in;
                    size: letter;
                  }
                  
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 11pt;
                    line-height: 1.3;
                    color: #000 !important;
                    background: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  
                  .printable-practice-plan {
                    background: white !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    max-width: none !important;
                    margin: 0 !important;
                  }
                  
                  /* POWLAX Brand Colors for Print */
                  .text-blue-600 {
                    color: #003366 !important;
                  }
                  
                  .text-orange-600 {
                    color: #FF6600 !important;
                  }
                  
                  .bg-blue-600 {
                    background-color: #003366 !important;
                  }
                  
                  .border-orange-500 {
                    border-color: #FF6600 !important;
                  }
                  
                  .border-blue-600 {
                    border-color: #003366 !important;
                  }
                  
                  .practice-title {
                    font-size: 18pt;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 12pt;
                    color: #003366 !important;
                  }
                  
                  /* Header styling */
                  .practice-header {
                    margin-bottom: 16pt !important;
                  }
                  
                  .practice-header .text-4xl {
                    font-size: 24pt !important;
                    font-weight: bold !important;
                  }
                  
                  .practice-header .text-lg {
                    font-size: 14pt !important;
                  }
                  
                  .practice-info {
                    margin-bottom: 16pt;
                    font-size: 10pt;
                    padding: 8pt !important;
                    border: 1px solid #ccc !important;
                    background: #f8f9fa !important;
                  }
                  
                  .practice-info .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6pt;
                  }
                  
                  /* Mobile print adjustments */
                  @media print and (max-width: 480px) {
                    .practice-info .grid {
                      grid-template-columns: 1fr;
                      gap: 4pt;
                    }
                  }
                  
                  .timeline-item {
                    margin-bottom: 12pt;
                    page-break-inside: avoid;
                    border: 1px solid #ddd !important;
                    border-radius: 4pt;
                    overflow: hidden;
                  }
                  
                  .timeline-time {
                    font-weight: bold;
                    font-size: 12pt;
                    color: white !important;
                    background-color: #003366 !important;
                    padding: 6pt !important;
                    margin: 0 !important;
                    border: none !important;
                  }
                  
                  .timeline-drill {
                    margin: 0 !important;
                    padding: 8pt !important;
                    border-left: 3pt solid #FF6600 !important;
                    padding-left: 12pt !important;
                  }
                  
                  .drill-name {
                    font-weight: bold;
                    font-size: 12pt;
                    color: #000 !important;
                    margin-bottom: 4pt;
                  }
                  
                  .drill-meta {
                    font-size: 9pt;
                    color: #666 !important;
                    margin: 2pt 0;
                  }
                  
                  .drill-description {
                    font-size: 10pt;
                    margin: 4pt 0;
                    color: #333 !important;
                    line-height: 1.4;
                  }
                  
                  .drill-notes {
                    font-size: 9pt;
                    color: #333 !important;
                    margin-top: 6pt;
                    padding: 6pt;
                    background: #fffbf0 !important;
                    border: 1px solid #f0e68c !important;
                    border-radius: 3pt;
                  }
                  
                  .practice-notes {
                    margin: 16pt 0;
                    padding: 10pt;
                    border: 1px solid #ff6600 !important;
                    background: #fff8f0 !important;
                    page-break-inside: avoid;
                    border-radius: 4pt;
                  }
                  
                  .notes-title {
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 6pt;
                    color: #ff6600 !important;
                  }
                  
                  .equipment-list {
                    margin: 16pt 0;
                    padding: 10pt;
                    border: 1px solid #28a745 !important;
                    background: #f8fff8 !important;
                    page-break-inside: avoid;
                    border-radius: 4pt;
                  }
                  
                  .equipment-title {
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 8pt;
                    color: #28a745 !important;
                  }
                  
                  .equipment-list .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 4pt;
                  }
                  
                  .equipment-list input[type="checkbox"] {
                    margin-right: 4pt;
                  }
                  
                  /* Mobile equipment list */
                  @media print and (max-width: 480px) {
                    .equipment-list .grid {
                      grid-template-columns: 1fr;
                    }
                  }
                }
                
                /* Hide non-essential elements when printing */
                @media print {
                  .no-print,
                  .fixed,
                  .sticky,
                  .absolute,
                  nav,
                  button:not(.print-keep),
                  .toolbar,
                  .sidebar {
                    display: none !important;
                  }
                  
                  /* Remove emojis for cleaner print */
                  .emoji {
                    display: none !important;
                  }
                  
                  /* Ensure proper spacing and readability */
                  h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                    margin-top: 8pt;
                    margin-bottom: 4pt;
                  }
                  
                  /* Signature section */
                  .signature-section {
                    margin-top: 24pt;
                    page-break-inside: avoid;
                  }
                  
                  /* Safety reminders */
                  .safety-reminders {
                    margin: 12pt 0;
                    padding: 8pt;
                    border: 1px solid #dc3545 !important;
                    background: #fff5f5 !important;
                    border-radius: 3pt;
                  }
                  
                  /* Footer */
                  .footer {
                    margin-top: 16pt;
                    padding-top: 8pt;
                    border-top: 1px solid #003366 !important;
                    text-align: center;
                    font-size: 9pt;
                  }
                }
              </style>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `)

        printWindow.document.close()
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 250)
        }
        
        // Fallback timeout in case onload doesn't fire
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.print()
            printWindow.close()
          }
        }, 1000)
      } else {
        // Print the entire page
        window.print()
      }
    } catch (error) {
      console.error('Error during printing:', error)
    } finally {
      setTimeout(() => setIsPrinting(false), 1000)
    }
  }, [])

  return {
    isPrinting,
    printContent
  }
}