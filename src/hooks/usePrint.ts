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
                    font-size: 12px;
                    line-height: 1.4;
                    color: #000;
                  }
                  
                  .printable-practice-plan {
                    background: white !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                  }
                  
                  .practice-title {
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 16px;
                    border-bottom: 2px solid #003366;
                    padding-bottom: 8px;
                  }
                  
                  .practice-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 20px;
                    font-size: 11px;
                  }
                  
                  .timeline-item {
                    margin-bottom: 16px;
                    page-break-inside: avoid;
                  }
                  
                  .timeline-time {
                    font-weight: bold;
                    font-size: 13px;
                    color: #003366;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 2px;
                    margin-bottom: 8px;
                  }
                  
                  .timeline-drill {
                    margin-left: 12px;
                    margin-bottom: 8px;
                  }
                  
                  .drill-name {
                    font-weight: bold;
                    font-size: 12px;
                  }
                  
                  .drill-meta {
                    font-size: 10px;
                    color: #666;
                    font-style: italic;
                  }
                  
                  .drill-description {
                    font-size: 11px;
                    margin: 4px 0;
                  }
                  
                  .drill-notes {
                    font-size: 10px;
                    color: #333;
                    margin-top: 4px;
                    padding: 4px;
                    background: #f9f9f9;
                  }
                  
                  .practice-notes {
                    margin: 20px 0;
                    padding: 12px;
                    border: 1px solid #ddd;
                    background: #f8f9fa;
                    page-break-inside: avoid;
                  }
                  
                  .notes-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                  }
                  
                  .equipment-list {
                    margin: 16px 0;
                    page-break-inside: avoid;
                  }
                  
                  .equipment-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                  }
                  
                  .equipment-list ul {
                    margin: 0;
                    padding-left: 16px;
                  }
                  
                  .equipment-list li {
                    margin: 2px 0;
                    font-size: 11px;
                  }
                }
                
                /* Hide non-essential elements when printing */
                @media print {
                  .no-print {
                    display: none !important;
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
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
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