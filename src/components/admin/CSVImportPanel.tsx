'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Play,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { UserCSVProcessor, type ImportOptions, type PreviewResult, type ImportResult } from '@/lib/csv/user-import-export'

interface CSVImportPanelProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: (result: ImportResult) => void
}

export default function CSVImportPanel({ isOpen, onClose, onImportComplete }: CSVImportPanelProps) {
  const [csvContent, setCsvContent] = useState<string>('')
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    updateExisting: true,
    createNew: true,
    validateEmails: true,
    assignDefaultRole: undefined,
    dryRun: false
  })
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'import' | 'complete'>('upload')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableRoles = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'club_director', label: 'Club Director' },
    { value: 'team_coach', label: 'Team Coach' },
    { value: 'player', label: 'Player' },
    { value: 'parent', label: 'Parent' }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvContent(content)
      setCurrentStep('preview')
    }
    reader.onerror = () => {
      toast.error('Error reading file')
    }
    reader.readAsText(file)
  }

  const handlePreview = async () => {
    if (!csvContent) {
      toast.error('Please select a CSV file first')
      return
    }

    try {
      setIsProcessing(true)
      const result = await UserCSVProcessor.previewImport(csvContent, importOptions)
      setPreviewResult(result)
      
      if (result.summary.hasErrors) {
        toast.warning(`Preview complete with ${result.validationErrors.length} validation errors`)
      } else {
        toast.success('Preview generated successfully')
      }
    } catch (error) {
      console.error('Preview failed:', error)
      toast.error('Preview failed: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async (dryRun = false) => {
    if (!csvContent) {
      toast.error('No CSV data to import')
      return
    }

    if (previewResult?.summary.hasErrors && !dryRun) {
      toast.error('Please fix validation errors before importing')
      return
    }

    try {
      setIsProcessing(true)
      setCurrentStep('import')
      
      const result = await UserCSVProcessor.importUsers(csvContent, {
        ...importOptions,
        dryRun
      })
      
      setImportResult(result)
      setCurrentStep('complete')
      
      if (result.success) {
        toast.success(`Import completed: ${result.created} created, ${result.updated} updated`)
        onImportComplete?.(result)
      } else {
        toast.error(`Import completed with errors: ${result.errors.length} failed`)
      }
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('Import failed: ' + (error as Error).message)
      setCurrentStep('preview')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCsvContent('')
    setPreviewResult(null)
    setImportResult(null)
    setCurrentStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSampleCSV = () => {
    const sampleCSV = UserCSVProcessor.generateSampleCSV()
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'powlax-users-sample.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Sample CSV downloaded')
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload':
        return <Upload className="h-4 w-4" />
      case 'preview':
        return <Eye className="h-4 w-4" />
      case 'import':
        return <Play className="h-4 w-4" />
      case 'complete':
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Users from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import or update user data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['upload', 'preview', 'import', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : index <= ['upload', 'preview', 'import', 'complete'].indexOf(currentStep)
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                }`}>
                  {getStepIcon(step)}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < ['upload', 'preview', 'import', 'complete'].indexOf(currentStep)
                      ? 'bg-green-600' 
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Select a CSV file containing user data to import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg">Drop your CSV file here or click to browse</p>
                    <p className="text-sm text-gray-600">Supports CSV files up to 10MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4"
                  >
                    Select CSV File
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Button onClick={downloadSampleCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample CSV
                  </Button>
                  <div className="text-sm text-gray-600">
                    Need help? Download our sample CSV to see the expected format
                  </div>
                </div>

                {/* Import Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="update-existing"
                          checked={importOptions.updateExisting}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, updateExisting: !!checked }))
                          }
                        />
                        <Label htmlFor="update-existing">Update existing users</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="create-new"
                          checked={importOptions.createNew}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, createNew: !!checked }))
                          }
                        />
                        <Label htmlFor="create-new">Create new users</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="validate-emails"
                          checked={importOptions.validateEmails}
                          onCheckedChange={(checked) => 
                            setImportOptions(prev => ({ ...prev, validateEmails: !!checked }))
                          }
                        />
                        <Label htmlFor="validate-emails">Validate email formats</Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="default-role">Default role for new users (optional)</Label>
                      <Select 
                        value={importOptions.assignDefaultRole || 'none'} 
                        onValueChange={(value) => 
                          setImportOptions(prev => ({ 
                            ...prev, 
                            assignDefaultRole: value === 'none' ? undefined : value 
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No default role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No default role</SelectItem>
                          {availableRoles.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview Import Data</span>
                  <div className="flex gap-2">
                    <Button onClick={handleReset} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Start Over
                    </Button>
                    <Button 
                      onClick={handlePreview} 
                      disabled={isProcessing}
                      size="sm"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Preview...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Generate Preview
                        </>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!previewResult ? (
                  <div className="text-center py-8 text-gray-500">
                    Click "Generate Preview" to see what will be imported
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {previewResult.summary.totalRows}
                          </div>
                          <div className="text-sm text-gray-600">Total Rows</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-green-600">
                            {previewResult.summary.toCreate}
                          </div>
                          <div className="text-sm text-gray-600">To Create</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-yellow-600">
                            {previewResult.summary.toUpdate}
                          </div>
                          <div className="text-sm text-gray-600">To Update</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-gray-600">
                            {previewResult.summary.toSkip}
                          </div>
                          <div className="text-sm text-gray-600">To Skip</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Validation Errors */}
                    {previewResult.validationErrors.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Validation Errors ({previewResult.validationErrors.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-40 overflow-y-auto">
                            {previewResult.validationErrors.map((error, index) => (
                              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded mb-1">
                                <strong>Row {error.row}, {error.field}:</strong> {error.error} 
                                {error.value && <span className="text-gray-600"> (value: "{error.value}")</span>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Preview Data */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Preview Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-64 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {previewResult.users.map((user) => (
                                <TableRow key={user.row}>
                                  <TableCell>{user.row}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>{user.display_name || '-'}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      user.action === 'create' ? 'default' :
                                      user.action === 'update' ? 'secondary' :
                                      'outline'
                                    }>
                                      {user.action}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {user.roles.map((role, index) => (
                                      <Badge key={index} variant="outline" className="text-xs mr-1">
                                        {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </Badge>
                                    ))}
                                  </TableCell>
                                  <TableCell>
                                    {user.validationErrors.length > 0 ? (
                                      <Badge variant="destructive">
                                        {user.validationErrors.length} errors
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Valid
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between">
                      <Button 
                        onClick={() => handleImport(true)}
                        variant="outline"
                        disabled={isProcessing}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Dry Run (Test Only)
                      </Button>
                      
                      <Button 
                        onClick={() => handleImport(false)}
                        disabled={isProcessing || previewResult.summary.hasErrors}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Import Users
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Import Progress */}
          {currentStep === 'import' && (
            <Card>
              <CardHeader>
                <CardTitle>Import in Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg">Processing your CSV file...</p>
                    <p className="text-sm text-gray-600">This may take a few moments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Import {importResult.success ? 'Completed' : 'Completed with Errors'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Results Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {importResult.totalRows}
                      </div>
                      <div className="text-sm text-gray-600">Total Processed</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-green-600">
                        {importResult.created}
                      </div>
                      <div className="text-sm text-gray-600">Created</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {importResult.updated}
                      </div>
                      <div className="text-sm text-gray-600">Updated</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-gray-600">
                        {importResult.skipped}
                      </div>
                      <div className="text-sm text-gray-600">Skipped</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        Import Errors ({importResult.errors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded mb-1">
                            <strong>Row {error.row} ({error.email}):</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                  <Button onClick={handleReset} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Another File
                  </Button>
                  
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}