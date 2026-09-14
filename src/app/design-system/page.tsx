import { PRESENCE_SLOT_COUNT } from "@/lib/presence";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { NavTabs } from "@/components/ui/nav-tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComponentsKitchenSink() {
    return (
        <main className="min-h-screen bg-brand-paper p-8 lg:p-16 text-brand-ink">
            <div className="max-w-4xl mx-auto space-y-14">
                <header className="max-w-[62ch]">
                    <h1 className="text-[36px] font-semibold tracking-[-0.028em] leading-tight">
                        Design system
                    </h1>
                    <p className="text-[15px] text-brand-subtle mt-2 leading-relaxed">
                        One rule holds the rest together: a saturated colour
                        always means a person. Blue is the single exception and
                        it belongs to the interface — focus, selection, links.
                    </p>
                </header>

                <section className="space-y-5">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Presence
                    </h2>
                    <p className="text-sm text-brand-subtle max-w-[68ch] leading-relaxed">
                        {PRESENCE_SLOT_COUNT} hues, none of them blue, assigned
                        to a person by a hash of their id so the same person is
                        the same colour on every surface and in every session.
                        Read them through <code>presenceVar()</code>; they are
                        deliberately not reachable as Tailwind utilities.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: PRESENCE_SLOT_COUNT }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-2 border border-brand-border rounded-brand bg-brand-surface"
                                >
                                    <span
                                        className="w-4 h-4 rounded-brand"
                                        style={{
                                            backgroundColor: `var(--color-brand-presence-${index + 1})`,
                                        }}
                                    />
                                    <span className="font-brand-mono text-[12px] text-brand-subtle">
                                        {index + 1}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Ink, paper and signal
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                        <div className="p-4 bg-brand-ink text-brand-paper rounded-brand">
                            Ink
                        </div>
                        <div className="p-4 bg-brand-paper text-brand-ink rounded-brand border border-brand-border">
                            Paper
                        </div>
                        <div className="p-4 bg-brand-surface text-brand-ink rounded-brand border border-brand-border">
                            Surface
                        </div>
                        <div className="p-4 bg-brand-accent text-brand-on-fill rounded-brand">
                            Accent — focus only
                        </div>
                    </div>
                </section>

                {/* Buttons */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Buttons
                    </h2>
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Button>With Arrow</Button>
                            <Button disabled>Disabled</Button>
                        </div>
                    </div>
                </section>

                {/* Link Buttons */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Link Buttons
                    </h2>
                    <p className="text-sm text-brand-subtle mb-4">
                        Uses next/link but styled identical to Buttons
                    </p>
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <LinkButton href="#" variant="primary">
                                Primary Link
                            </LinkButton>
                            <LinkButton href="#" variant="secondary">
                                Secondary Link
                            </LinkButton>
                            <LinkButton href="#" variant="ghost">
                                Ghost Link
                            </LinkButton>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <LinkButton href="#" size="sm">
                                Small Link
                            </LinkButton>
                            <LinkButton href="#" size="md">
                                Medium Link
                            </LinkButton>
                            <LinkButton href="#" size="lg">
                                Large Link
                            </LinkButton>
                        </div>
                    </div>
                </section>

                {/* Navigation Tabs */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Navigation Tabs (NavTabs)
                    </h2>
                    <p className="text-sm text-brand-subtle mb-4">
                        Single source of truth for tabbed routing, workspace
                        sections, settings, and filter bars.
                    </p>
                    <div className="space-y-6">
                        <div>
                            <span className="font-brand-mono text-xs text-brand-subtle block mb-2">
                                Standard Link Tabs (Active: Overview)
                            </span>
                            <NavTabs
                                ariaLabel="Design system demo tabs"
                                items={[
                                    {
                                        label: "Overview",
                                        href: "#overview",
                                        active: true,
                                    },
                                    { label: "Documents", href: "#documents" },
                                    { label: "Tasks", href: "#tasks" },
                                    { label: "Chat", href: "#chat" },
                                    { label: "Settings", href: "#settings" },
                                ]}
                            />
                        </div>
                        <div>
                            <span className="font-brand-mono text-xs text-brand-subtle block mb-2">
                                With Badges & Small Size Variant
                            </span>
                            <NavTabs
                                size="sm"
                                ariaLabel="Design system badge tabs"
                                activeValue="public"
                                items={[
                                    {
                                        value: "my",
                                        label: "My Workspaces",
                                        badge: <Badge intent="muted">3</Badge>,
                                    },
                                    {
                                        value: "public",
                                        label: "Discover Public",
                                        badge: (
                                            <Badge intent="default">12</Badge>
                                        ),
                                    },
                                    {
                                        value: "archived",
                                        label: "Archived",
                                        disabled: true,
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {/* Badges & Alerts */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Badges & Alerts
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <Badge intent="default">Default</Badge>
                        <Badge intent="success">Success</Badge>
                        <Badge intent="warning">Warning</Badge>
                        <Badge intent="danger">Danger</Badge>
                    </div>
                    <div className="space-y-4 pt-4">
                        <Alert intent="default">
                            This is a default informative alert.
                        </Alert>
                        <Alert intent="success">
                            Operation completed successfully.
                        </Alert>
                        <Alert intent="warning">
                            Please check your configuration settings.
                        </Alert>
                        <Alert intent="danger">
                            A critical error occurred during the process.
                        </Alert>
                    </div>
                </section>

                {/* Inputs & Forms */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Forms
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Input
                                label="Standard Input"
                                placeholder="Type something..."
                            />
                            <Input
                                label="With Hint"
                                placeholder="username"
                                hint="This will be public."
                            />
                            <Input
                                label="With Error"
                                placeholder="email@"
                                error="Invalid email address."
                            />
                        </div>
                        <div>
                            <FormField
                                label="Wrapped Form Field"
                                htmlFor="demo-field"
                                required
                                error="Required field missing"
                            >
                                <Input
                                    id="demo-field"
                                    placeholder="Inside FormField..."
                                    error="Required field missing"
                                />
                            </FormField>
                        </div>
                    </div>
                </section>

                {/* Cards & Separators */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Layout (Cards & Separators)
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Standard Card</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <p>
                                    This is a standard flat card using the
                                    default brand borders.
                                </p>
                            </CardBody>
                        </Card>

                        <Card elevated>
                            <CardHeader>
                                <CardTitle>Elevated Card</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <p className="mb-4">
                                    This card uses the hard drop-shadow for a
                                    lifted Machined Precision look.
                                </p>
                                <Separator label="OR" />
                                <Button className="w-full" variant="secondary">
                                    Take Action
                                </Button>
                            </CardBody>
                        </Card>

                        <Card elevated interactive>
                            <CardHeader>
                                <CardTitle>Interactive Card</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <p className="mb-4">
                                    Hover over this card to see the accent
                                    border, lift animation, and shadow
                                    expansion.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </section>

                {/* Skeletons */}
                <section className="space-y-6">
                    <h2 className="text-[22px] font-semibold tracking-[-0.018em] border-b border-brand-border pb-2">
                        Skeletons (Loading States)
                    </h2>
                    <div className="flex gap-4 items-center max-w-md">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
