'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
// import { Slider } from '@/components/ui/slider' // Component doesn't exist yet
// import { Switch } from '@/components/ui/switch' // Component doesn't exist yet
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Trophy, Users, Calendar, Activity, Target, Award, Star, TrendingUp, Clock, User, ChevronRight, Play, Settings } from 'lucide-react'

// Mock components for dashboard system
const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && <p className="text-xs text-green-600">{trend}</p>}
        </div>
        {Icon && <Icon className="h-8 w-8 text-gray-400" />}
      </div>
    </CardContent>
  </Card>
)

const ActionCard = ({ title, description, action }: any) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
    <CardContent className="p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <Button variant="outline" size="sm" className="mt-3">
        {action}
      </Button>
    </CardContent>
  </Card>
)

const ProgressCard = ({ title, progress, total }: any) => (
  <Card>
    <CardContent className="p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <Progress value={(progress / total) * 100} className="mb-2" />
      <p className="text-sm text-gray-600">{progress} of {total} completed</p>
    </CardContent>
  </Card>
)

const ScheduleCard = ({ events }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {events.map((event: any, i: number) => (
          <div key={i} className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{event.time}</span>
            <span className="font-medium">{event.title}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Component preview mapping
export const componentPreviews: Record<string, React.ReactNode> = {
  // UI Foundation Components
  'Button': (
    <div className="flex gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  'Card': (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">This is the card content area</p>
      </CardContent>
    </Card>
  ),
  'Input': (
    <div className="space-y-2 w-full max-w-sm">
      <Label htmlFor="demo-input">Input Field</Label>
      <Input id="demo-input" placeholder="Enter text..." />
    </div>
  ),
  'Dialog': (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description text</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  'Select': (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  'Table': (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Player 1</TableCell>
          <TableCell><Badge>Active</Badge></TableCell>
          <TableCell>95</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Player 2</TableCell>
          <TableCell><Badge variant="secondary">Inactive</Badge></TableCell>
          <TableCell>82</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  'Tabs': (
    <Tabs defaultValue="tab1" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <Card>
          <CardContent className="p-4">
            <p>Tab 1 content</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
  'Progress': (
    <div className="space-y-2 w-full max-w-sm">
      <Progress value={33} />
      <Progress value={66} />
      <Progress value={100} />
    </div>
  ),
  'Badge': (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  'Avatar': (
    <div className="flex gap-2">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </div>
  ),
  'Checkbox': (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox id="check1" />
        <Label htmlFor="check1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="check2" defaultChecked />
        <Label htmlFor="check2">Option 2 (checked)</Label>
      </div>
    </div>
  ),
  'Label': (
    <div className="space-y-2">
      <Label>Standard Label</Label>
      <Label htmlFor="input">Label for Input</Label>
    </div>
  ),
  'Textarea': (
    <div className="space-y-2 w-full max-w-sm">
      <Label htmlFor="textarea">Message</Label>
      <Textarea id="textarea" placeholder="Type your message here..." />
    </div>
  ),
  'Accordion': (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Accordion Item 1</AccordionTrigger>
        <AccordionContent>Content for item 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Accordion Item 2</AccordionTrigger>
        <AccordionContent>Content for item 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  'ScrollArea': (
    <ScrollArea className="h-[100px] w-[200px] rounded-md border p-4">
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i} className="text-sm">Scrollable item {i + 1}</p>
        ))}
      </div>
    </ScrollArea>
  ),
  'Separator': (
    <div className="space-y-2 w-full max-w-sm">
      <div>Content above separator</div>
      <Separator />
      <div>Content below separator</div>
    </div>
  ),
  'DropdownMenu': (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  'Skeleton': (
    <div className="space-y-2 w-full max-w-sm">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),
  'Slider': (
    <div className="w-full max-w-sm space-y-2">
      <Label>Volume Control</Label>
      <div className="h-2 bg-gray-200 rounded-full">
        <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
      </div>
      <p className="text-xs text-gray-500">Slider component placeholder</p>
    </div>
  ),
  'Switch': (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
        </div>
        <Label>Enable notifications</Label>
      </div>
      <p className="text-xs text-gray-500">Switch component placeholder</p>
    </div>
  ),
  'Toast': (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Toast Notification</AlertTitle>
      <AlertDescription>This is how toast notifications appear</AlertDescription>
    </Alert>
  ),

  // Dashboard Components
  'PlayerDashboard': (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Player Dashboard</h2>
        <Badge variant="destructive">100% Mock Data</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Points" value="1,250" icon={Trophy} trend="+15%" />
        <StatCard title="Rank" value="Gold" icon={Award} />
      </div>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Critical: No database connection</AlertDescription>
      </Alert>
    </div>
  ),
  'ParentDashboard': (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Parent Dashboard</h2>
        <Badge className="bg-green-500">Excellence Example</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-gray-600">Children</p>
            <p className="text-lg font-bold">2 Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-gray-600">Next Practice</p>
            <p className="text-lg font-bold">Tomorrow 4PM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
  'CoachDashboard': (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Coach Dashboard</h2>
        <Badge>Permanence Pattern</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ActionCard title="Plan Practice" description="Create new plan" action="Create" />
        <ActionCard title="View Roster" description="12 players" action="View" />
        <ActionCard title="Drills Library" description="135 drills" action="Browse" />
      </div>
    </div>
  ),
  'AdminDashboard': (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <Badge variant="secondary">85% Mock Data</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Users" value="342" icon={Users} />
        <StatCard title="Active Teams" value="14" icon={Activity} />
      </div>
    </div>
  ),
  'DirectorDashboard': (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold">Director Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Clubs" value="3" icon={Users} />
        <StatCard title="Teams" value="14" icon={Target} />
      </div>
    </div>
  ),
  'PublicDashboard': (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold">POWLAX Platform</h2>
      <p className="text-sm text-gray-600">Transform youth lacrosse with structured practice planning</p>
      <Button className="w-full">Get Started</Button>
    </div>
  ),
  'ActionCard': <ActionCard title="Quick Action" description="Perform this action" action="Go" />,
  'StatCard': <StatCard title="Metric" value="42" icon={TrendingUp} trend="+5%" />,
  'ProgressCard': <ProgressCard title="Season Progress" progress={7} total={10} />,
  'ScheduleCard': <ScheduleCard events={[
    { time: '4:00 PM', title: 'Practice' },
    { time: '6:00 PM', title: 'Game vs Eagles' }
  ]} />,

  // Practice Planner Components (simplified previews)
  'PracticePlanner': (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Practice Planner</h2>
        <Badge className="bg-green-500">100% Real Data</Badge>
      </div>
      <Tabs defaultValue="drills" className="w-full">
        <TabsList>
          <TabsTrigger value="drills">Drills</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ),
  'DrillCard': (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">Ground Ball Drill</h3>
            <p className="text-sm text-gray-600">Fundamentals • 10 min</p>
          </div>
          <Button size="sm" variant="outline">Add</Button>
        </div>
      </CardContent>
    </Card>
  ),

  // Skills Academy Components
  'WorkoutPlayer': (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Wall Ball Workout</h3>
          <Badge>Series 1</Badge>
        </div>
        <Progress value={45} />
        <div className="flex gap-2">
          <Button size="sm"><Play className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline">Skip</Button>
        </div>
      </div>
    </div>
  ),

  // Team Components
  'PlayerStatsCard': (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">John Smith</h3>
          <Badge className="bg-green-500">95% Real Data</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">1,250</p>
            <p className="text-xs text-gray-600">Points</p>
          </div>
          <div>
            <p className="text-2xl font-bold">Gold</p>
            <p className="text-xs text-gray-600">Rank</p>
          </div>
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-gray-600">Badges</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),

  // Gamification Components
  'RankDisplay': (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Player Rank</h3>
        <Badge variant="destructive">Hardcoded Data</Badge>
      </div>
      <div className="flex items-center space-x-2">
        <Star className="h-8 w-8 text-yellow-500" />
        <div>
          <p className="font-bold text-lg">Gold Rank</p>
          <p className="text-sm text-gray-600">1,250 / 2,000 XP</p>
        </div>
      </div>
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Database mismatch issue</AlertDescription>
      </Alert>
    </div>
  ),

  // Miscellaneous Components
  'GlobalSearch': (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Global Search</h3>
        <Badge variant="destructive">100% Mock Data</Badge>
      </div>
      <Input placeholder="Search drills, players, teams..." />
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Not connected to database</AlertDescription>
      </Alert>
    </div>
  ),
  'ResourceDetailModal': (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Resource Detail</h3>
          <Badge className="bg-green-500">Excellence</Badge>
        </div>
        <p className="text-sm text-gray-600">Permanence pattern implementation</p>
      </CardContent>
    </Card>
  )
}

// Default preview for components without specific preview
export const defaultPreview = (
  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
    <p className="text-sm text-gray-500 text-center">Component preview not available</p>
  </div>
)