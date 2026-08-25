import * as React from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/ui/form-field";

export default function ComponentsKitchenSink() {
    return (
        <main className="min-h-screen bg-brand-surface p-12 lg:p-24 font-brand-sans text-brand-ink">
            <div className="max-w-4xl mx-auto space-y-16">
                <header className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter">
                        Design System
                    </h1>
                    <p className="text-brand-subtle font-brand-mono text-sm uppercase tracking-widest">
                        Component Library & Primitives
                    </p>
                </header>

                {/* Typography / Colors */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
                        Colors & Tokens
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-brand-mono text-xs uppercase tracking-wider">
                        <div className="p-4 bg-brand-ink text-brand-surface rounded-brand border-2 border-brand-ink">
                            Brand Ink
                        </div>
                        <div className="p-4 bg-brand-accent text-brand-surface rounded-brand border-2 border-brand-accent">
                            Brand Accent
                        </div>
                        <div className="p-4 bg-brand-surface text-brand-ink rounded-brand border-2 border-brand-ink">
                            Brand Surface
                        </div>
                        <div className="p-4 bg-brand-muted text-brand-ink rounded-brand border-2 border-brand-muted">
                            Brand Muted
                        </div>
                    </div>
                </section>

                {/* Buttons */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
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
                            <Button withArrow>With Arrow</Button>
                            <Button disabled>Disabled</Button>
                        </div>
                    </div>
                </section>

                {/* Link Buttons */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
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

                {/* Badges & Alerts */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
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
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
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
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
                        Layout (Cards & Separators)
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
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
                    </div>
                </section>

                {/* Skeletons */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b-2 border-brand-muted pb-2">
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
