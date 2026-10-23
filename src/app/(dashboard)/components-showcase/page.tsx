'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { ButtonGroup } from '@/components/ui/button-group';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger as DialogTriggerComp } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger as SheetTriggerComp } from '@/components/ui/sheet';

export default function ComponentsShowcasePage() {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">Component Showcase</h1>
        <p className="text-fg-muted text-sm">
          Browse and test every available UI component. Each section shows variants, sizes, states, and usage examples.
        </p>
      </div>

      <section id="buttons" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Buttons</h2>
          <p className="text-fg-muted text-sm">
            All button variants, sizes, and states.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="muted">Muted</Button>
          <Button variant="success">Success</Button>
          <Button size="sm" variant="default">Small</Button>
          <Button size="lg" variant="default">Large</Button>
          <Button size="icon" variant="ghost" aria-label="Icon button" />
          <Button variant="default" disabled>Disabled</Button>
          <Button variant="default" loading>Loading</Button>
        </div>
      </section>

      <section id="inputs" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Inputs</h2>
          <p className="text-fg-muted text-sm">
            Text, email, password, textarea, with label, disabled, and error states.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Text input</Label>
            <Input placeholder="Enter text" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input type="email" placeholder="email@example.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Disabled</Label>
            <Input placeholder="Disabled" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Error</Label>
            <Input placeholder="Error state" aria-invalid="true" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Textarea</Label>
            <Textarea placeholder="Enter longer text..." rows={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Error textarea</Label>
            <Textarea placeholder="Error state" aria-invalid="true" rows={3} />
          </div>
        </div>
      </section>

      <section id="selects" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Selects</h2>
          <p className="text-fg-muted text-sm">
            Select component with multiple options.
          </p>
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-2 w-64">
            <Label>Theme mode</Label>
            <Select value="system" onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-64">
            <Label>Disabled select</Label>
            <Select value="option1" disabled onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section id="toggles" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Toggles &amp; Switches</h2>
          <p className="text-fg-muted text-sm">
            Switch, toggle, toggle group, checkbox, radio group.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Switch</span>
            <Switch label="Enabled" checked onChange={() => {}} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Switch off</span>
            <Switch label="Disabled" checked={false} onChange={() => {}} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Checkbox</span>
            <Checkbox checked onCheckedChange={() => {}} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Checkbox unchecked</span>
            <Checkbox checked={false} onCheckedChange={() => {}} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Radio group</span>
            <RadioGroup value="a" onValueChange={() => {}}>
              <RadioGroupItem value="a">Option A</RadioGroupItem>
              <RadioGroupItem value="b">Option B</RadioGroupItem>
              <RadioGroupItem value="c">Option C</RadioGroupItem>
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Toggle</span>
            <Toggle pressed onPressedChange={() => {}}>Active</Toggle>
          </div>
        </div>
      </section>

      <section id="overlays" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Overlays</h2>
          <p className="text-fg-muted text-sm">
            Dialog, sheet, popover, tooltip with trigger examples.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Dialog open={open} onOpenChange={setOpen} title="Dialog Title" description="Dialog description">
            <DialogTriggerComp asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTriggerComp>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
              </DialogHeader>
              <p>This is a dialog component example.</p>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTriggerComp asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTriggerComp>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
              </SheetHeader>
              <p>This is a sheet component example.</p>
            </SheetContent>
          </Sheet>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>This is a tooltip</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverAnchor asChild>
              <Button variant="outline">Popover</Button>
            </PopoverAnchor>
            <PopoverContent align="start">
              <p>Popover content example</p>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <section id="data-display" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Data Display</h2>
          <p className="text-fg-muted text-sm">
            Table, card, stat card, badge, avatar, status indicator.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Status Indicators</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <StatusIndicator variant="success" />
                <span className="text-fg text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator variant="warning" />
                <span className="text-fg text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator variant="destructive" />
                <span className="text-fg text-sm">Destructive</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator variant="muted" />
                <span className="text-fg text-sm">Muted</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Avatars</h3>
            <div className="flex flex-wrap gap-3">
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Felix" />
                <AvatarFallback>F</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Stat Cards</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total Vendors" value="1,234" growthRate="+12%" />
              <StatCard title="Total Payments" value="$54,321" growthRate="+5.2%" />
              <StatCard title="Pending Reviews" value="23" growthRate="-2%" />
            </div>
          </div>

          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Table</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 1, name: 'Demo Shop', status: 'active' },
                  { id: 2, name: 'Test Vendor', status: 'pending' },
                  { id: 3, name: 'Sample Store', status: 'suspended' },
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'destructive'}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section id="feedback" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Feedback</h2>
          <p className="text-fg-muted text-sm">
            Alert, progress, skeleton, spinner with loading and error states.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your changes have been saved successfully.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong. Please try again.</AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">Progress bars</span>
            <Progress value={75} />
            <Progress value={100} variant="success" />
            <Progress value={50} variant="destructive" />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-fg text-sm font-medium">Loading states</span>
            <div className="flex gap-4">
              <Skeleton className="size-12 rounded-lg" />
              <Spinner className="size-8" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <section id="navigation" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Navigation</h2>
          <p className="text-fg-muted text-sm">
            Tabs, accordion, breadcrumb, separator.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Tabs</h3>
            <Tabs value="tab1" onValueChange={() => {}}>
              <TabsList>
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Details</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">Overview content</TabsContent>
              <TabsContent value="tab2">Details content</TabsContent>
              <TabsContent value="tab3">Settings content</TabsContent>
            </Tabs>
          </div>
          <div>
            <h3 className="text-fg text-sm font-semibold mb-3">Accordion</h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Section 1</AccordionTrigger>
                <AccordionContent>Content for section 1</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Section 2</AccordionTrigger>
                <AccordionContent>Content for section 2</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="col-span-2">
            <h3 className="text-fg text-sm font-semibold mb-3">Breadcrumb</h3>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/vendors">Vendors</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Demo Shop</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="hidden lg:block mx-4" />
            <Separator />
          </div>
        </div>
      </section>

      <section id="layout" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Layout</h2>
          <p className="text-fg-muted text-sm">
            Button group, separator.
          </p>
        </div>
        <div className="flex gap-4">
          <ButtonGroup>
            <Button variant="outline" size="sm">Left</Button>
            <Button variant="outline" size="sm">Center</Button>
            <Button variant="outline" size="sm">Right</Button>
          </ButtonGroup>
          <Separator orientation="vertical" className="mx-4" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Action</Button>
            <Button variant="default" size="sm">Primary</Button>
          </div>
        </div>
      </section>

      <section id="theme-settings" className="border border-border rounded-lg bg-background p-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-fg text-lg font-semibold">Theme Settings</h2>
          <p className="text-fg-muted text-sm">
            Centralized theme configuration accessible from the top bar.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" aria-label="Open theme settings">
            <span className="sr-only">Open theme settings</span>
            ⚙️
          </Button>
          <p className="text-fg-muted text-sm">
            Click the settings button in the top bar to open the theme panel with
            theme modes, font size, density, radius, and accent color options.
          </p>
        </div>
      </section>
    </div>
  );
}
