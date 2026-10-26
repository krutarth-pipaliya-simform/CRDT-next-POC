import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarClock, Plus, X } from "lucide-react";

import { ContourBackground } from "@/components/paddock/contour-background";
import {
    CollaboratorHighlight,
    CursorFlag,
} from "@/components/paddock/cursor-flag";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { Marquee } from "@/components/paddock/marquee";
import { NotchedCard } from "@/components/paddock/notched-card";
import { NotificationRow } from "@/components/paddock/notification-row";
import {
    AvatarStack,
    PaddockAvatar,
} from "@/components/paddock/paddock-avatar";
import {
    PaddockButton,
    PaddockIconButton,
    PaddockLinkButton,
} from "@/components/paddock/paddock-button";
import {
    PaddockInput,
    PaddockSelect,
    PaddockTextarea,
} from "@/components/paddock/paddock-field";
import {
    PriorityLabel,
    RolePill,
    StatusPill,
} from "@/components/paddock/paddock-pills";
import { PaddockRoot } from "@/components/paddock/paddock-root";
import { PaddockStatTile } from "@/components/paddock/paddock-stat-tile";
import { PlanCard } from "@/components/paddock/plan-card";
import { RadioCardGroup } from "@/components/paddock/radio-card-group";
import { Scribble } from "@/components/paddock/scribble";
import { Tag } from "@/components/paddock/tag";
import { Wordmark } from "@/components/paddock/wordmark";
import { WordReveal } from "@/components/paddock/word-reveal";
import { WorkspaceTabs } from "@/components/paddock/workspace-tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChatDemo } from "@/features/design-system/components/chat-demo";
import { DialogDemo } from "@/features/design-system/components/dialog-demo";
import { LoaderDemo } from "@/features/design-system/components/loader-demo";
import { PillTabsDemo } from "@/features/design-system/components/pill-tabs-demo";
import { ShowcaseMenu } from "@/features/design-system/components/showcase-menu";
import {
    ShowcaseSection,
    Specimen,
    SpecimenRow,
} from "@/features/design-system/components/showcase-section";
import { ToolbarDemo } from "@/features/design-system/components/toolbar-demo";
import {
    DEMO_PEOPLE,
    DEMO_TEAM,
    SHOWCASE_INDEX,
} from "@/features/design-system/lib/paddock-demo-data";

export const metadata: Metadata = {
    title: "Paddock design system",
    description:
        "The component set of the Paddock visual direction, rendered live.",
};

/** Class names are spelled out in full so Tailwind can find and emit them. */
const SURFACE_SWATCHES = [
    {
        name: "Paper",
        token: "paddock-paper",
        swatch: "bg-paddock-paper",
        role: "Page ground",
    },
    {
        name: "Sheet",
        token: "paddock-sheet",
        swatch: "bg-paddock-sheet",
        role: "Cards, panels, fields",
    },
    {
        name: "Ink",
        token: "paddock-ink",
        swatch: "bg-paddock-ink",
        role: "Text and strokes; flips with the theme",
    },
    {
        name: "Subtle",
        token: "paddock-subtle",
        swatch: "bg-paddock-subtle",
        role: "Secondary text, 5.7:1 on paper",
    },
    {
        name: "Night",
        token: "paddock-night",
        swatch: "bg-paddock-night",
        role: "Inverted bands; dark in both themes",
    },
    {
        name: "Deep",
        token: "paddock-deep",
        swatch: "bg-paddock-deep",
        role: "The darkest band",
    },
    {
        name: "Lime",
        token: "paddock-lime",
        swatch: "bg-paddock-lime",
        role: "Fill with on-fill text; text on night only",
    },
    {
        name: "Danger",
        token: "paddock-danger",
        swatch: "bg-paddock-danger",
        role: "Destructive actions and errors",
    },
    {
        name: "Warning",
        token: "paddock-warning",
        swatch: "bg-paddock-warning",
        role: "Attention, e.g. high priority",
    },
];

const PEOPLE_SWATCHES = [
    { name: "Coral", token: "--color-paddock-presence-1" },
    { name: "Amber", token: "--color-paddock-presence-2" },
    { name: "Cyan", token: "--color-paddock-presence-3" },
    { name: "Violet", token: "--color-paddock-presence-4" },
];

const WORKSPACE_TABS = [
    "Overview",
    "Documents",
    "Tasks",
    "Chat",
    "Activity",
    "Analytics",
    "Settings",
].map((label) => ({
    label,
    href: `#navigation-${label.toLowerCase()}`,
    current: label === "Tasks",
}));

export default function PaddockDesignSystemPage() {
    return (
        <PaddockRoot>
            <a
                href="#index"
                className="sr-only z-50 rounded-paddock bg-paddock-lime px-4 py-3 font-semibold text-paddock-on-fill focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
            >
                Skip to the component index
            </a>

            <header className="sticky top-0 z-40 border-b border-paddock-rule bg-paddock-paper">
                <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <Link
                        href="/design-system/v2"
                        aria-label="Paddock design system, top of page"
                        className="no-underline"
                    >
                        <Wordmark />
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <PaddockLinkButton
                            href="/design-system"
                            variant="outline"
                            voice="plain"
                            size="sm"
                            className="hidden sm:inline-flex"
                        >
                            Current (v1)
                        </PaddockLinkButton>
                        <ThemeToggle className="hidden md:flex" />
                        <ShowcaseMenu currentId="foundations" />
                    </div>
                </div>
            </header>

            <main id="main">
                <section
                    aria-labelledby="hero-heading"
                    className="relative overflow-hidden px-4 pt-16 pb-14 sm:px-6"
                >
                    <ContourBackground pattern="hero" />
                    <div className="relative mx-auto flex max-w-[77rem] flex-col gap-7">
                        <Tag>Converge · design system v2</Tag>
                        <div className="relative w-fit">
                            <DisplayHeading
                                id="hero-heading"
                                as="h1"
                                size="xl"
                                serif="The paddock"
                                heavy="component set"
                            />
                            <Scribble
                                shape="loop"
                                delayMs={400}
                                className="absolute -right-6 -bottom-12 hidden h-24 w-72 md:block"
                            />
                        </div>
                        <p className="m-0 max-w-[36rem] text-lg leading-relaxed">
                            Paper, olive ink and one acid lime. Every component
                            of the Paddock direction, live, with its states and
                            a note on when to reach for it. The current system
                            is unchanged and still documented at v1.
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            <PaddockLinkButton href="#index" size="lg">
                                Browse components
                            </PaddockLinkButton>
                            <PaddockLinkButton
                                href="/design-system"
                                variant="outline"
                                size="lg"
                            >
                                Current (v1)
                            </PaddockLinkButton>
                        </div>
                    </div>
                </section>

                <nav
                    id="index"
                    aria-label="Component index"
                    className="scroll-mt-24 border-t border-paddock-rule px-4 py-14 sm:px-6"
                >
                    <div className="mx-auto flex max-w-[77rem] flex-col gap-8">
                        <Tag as="h2" tone="ink">
                            Component index
                        </Tag>
                        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-x-8 gap-y-7 p-0">
                            {SHOWCASE_INDEX.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex flex-col gap-2 border-t-[1.5px] border-paddock-ink pt-3"
                                >
                                    <a
                                        href={`#${entry.id}`}
                                        className="paddock-heavy w-fit text-xl no-underline hover:underline hover:underline-offset-4"
                                    >
                                        {entry.label}
                                    </a>
                                    <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-[0.90625rem] text-paddock-subtle">
                                        {entry.components.map((component) => (
                                            <li key={component}>{component}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <ShowcaseSection
                    id="foundations"
                    eyebrow="Foundations"
                    serif="Paper, ink"
                    heavy="and one lime"
                    intro="Tokens are namespaced paddock so nothing in the current product changes. Ink flips with the theme; night and deep stay dark, which is what lets lime be text on them."
                >
                    <Specimen
                        title="Tokens"
                        usage="Use the token, never the value. Lime is a fill with on-fill text, or text on night and deep only. People colours are assigned by paddockPresenceVar(userId), never chosen."
                        components={["--color-paddock-*"]}
                    >
                        <div className="flex flex-col gap-8">
                            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-3 p-0">
                                {SURFACE_SWATCHES.map((swatch) => (
                                    <li
                                        key={swatch.token}
                                        className="overflow-hidden rounded-paddock-card border border-paddock-rule bg-paddock-sheet"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`block h-16 border-b border-paddock-rule ${swatch.swatch}`}
                                        />
                                        <span className="flex flex-col gap-1 p-3">
                                            <span className="font-bold">
                                                {swatch.name}
                                            </span>
                                            <code className="paddock-mono text-[0.6875rem] text-paddock-subtle">
                                                {swatch.token}
                                            </code>
                                            <span className="text-[0.8125rem] leading-snug text-paddock-subtle">
                                                {swatch.role}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <SpecimenRow label="People — assigned by hash, light in both themes">
                                {PEOPLE_SWATCHES.map((swatch) => (
                                    <span
                                        key={swatch.token}
                                        className="flex items-center gap-2 rounded-full border border-paddock-rule bg-paddock-sheet py-1 pr-3 pl-1"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="size-7 rounded-full"
                                            style={{
                                                backgroundColor: `var(${swatch.token})`,
                                            }}
                                        />
                                        <span className="text-sm font-semibold">
                                            {swatch.name}
                                        </span>
                                    </span>
                                ))}
                            </SpecimenRow>
                            <aside
                                aria-labelledby="open-decisions-heading"
                                className="rounded-paddock-card border-[1.5px] border-dashed border-paddock-ink px-5 py-4"
                            >
                                <h4
                                    id="open-decisions-heading"
                                    className="m-0 text-[0.9375rem] font-bold"
                                >
                                    Open decisions before Paddock ships
                                </h4>
                                <ul className="m-0 mt-2 flex list-disc flex-col gap-1 pl-5 text-[0.90625rem] text-paddock-subtle">
                                    <li>
                                        Lime replaces blue as the system colour,
                                        against “blue belongs to the system”.
                                    </li>
                                    <li>
                                        Tags and display type are uppercase,
                                        against “sentence case, no tracked
                                        caps”.
                                    </li>
                                    <li>
                                        The marquee, menu drift and loader move
                                        without being asked, against “motion
                                        answers an action”.
                                    </li>
                                    <li>
                                        Four people colours instead of eight,
                                        and one of them is cyan.
                                    </li>
                                </ul>
                            </aside>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Wordmark"
                        usage="The product name in both voices. Small in the header, large on the loader. On night grounds the serif half turns lime."
                        components={["Wordmark"]}
                    >
                        <div className="flex flex-wrap items-end gap-6">
                            <Wordmark size="sm" />
                            <Wordmark size="md" />
                            <Wordmark size="lg" />
                            <div className="paddock-night rounded-paddock-card px-6 py-5">
                                <Wordmark size="md" surface="night" />
                            </div>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Display heading"
                        usage="Page and section titles: a serif line that sets up, a heavy line that lands. Write it in sentence case; CSS sets the caps, so screen readers hear words. One heading per view at xl."
                        components={["DisplayHeading"]}
                    >
                        <div className="flex flex-col gap-10">
                            <div className="relative w-fit">
                                <DisplayHeading
                                    as="p"
                                    size="xl"
                                    serif="Everyone types"
                                    heavy="at once."
                                    outline="Nothing gets lost."
                                />
                            </div>
                            <div className="flex flex-wrap items-end gap-10">
                                <DisplayHeading
                                    as="p"
                                    size="lg"
                                    serif="The"
                                    heavy="board"
                                />
                                <DisplayHeading
                                    as="p"
                                    size="md"
                                    order="heavy-first"
                                    serif="studio"
                                    heavy="Halden"
                                />
                                <DisplayHeading
                                    as="p"
                                    size="sm"
                                    layout="inline"
                                    serif="Everyone in"
                                    heavy="Halden Studio"
                                />
                            </div>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Tag"
                        usage="Eyebrows, field labels and metadata. Short — two to four words. Subtle on paper by default; lime only on night."
                        components={["Tag"]}
                    >
                        <div className="flex flex-wrap items-center gap-6">
                            <Tag>Halden Studio — Tasks</Tag>
                            <Tag tone="ink">Task title</Tag>
                            <span className="paddock-night flex gap-6 rounded-paddock px-4 py-3">
                                <Tag tone="night-subtle">Current plan</Tag>
                                <Tag tone="lime">
                                    Same paragraph · two authors
                                </Tag>
                            </span>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Contour background"
                        usage="Faint isolines behind heroes and night bands. Decorative and stretched to fill; the parent sets the size and clips it."
                        components={["ContourBackground"]}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="relative h-44 overflow-hidden rounded-paddock-card border border-paddock-rule">
                                <ContourBackground pattern="hero" />
                                <Tag className="absolute bottom-3 left-4">
                                    Paper · hero
                                </Tag>
                            </div>
                            <div className="paddock-night relative h-44 overflow-hidden rounded-paddock-card">
                                <ContourBackground
                                    pattern="band"
                                    surface="night"
                                />
                                <Tag
                                    tone="night-subtle"
                                    className="absolute bottom-3 left-4"
                                >
                                    Night · band
                                </Tag>
                            </div>
                        </div>
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="actions"
                    eyebrow="Actions"
                    serif="Press"
                    heavy="here"
                    intro="Lime marks the one primary action in a view. Everything else is an ink outline or a ghost. Buttons lift 2px on hover and press in on click."
                >
                    <Specimen
                        title="Buttons"
                        usage="Name the button by what it does. Display voice (heavy caps) for primary and page-level actions; plain voice for the quieter ones in dialogs and lists. Danger only for destruction."
                        components={["PaddockButton", "PaddockLinkButton"]}
                    >
                        <div className="flex flex-col gap-7">
                            <SpecimenRow label="Variants">
                                <PaddockButton>
                                    Create a workspace
                                </PaddockButton>
                                <PaddockButton variant="outline">
                                    Log in
                                </PaddockButton>
                                <PaddockButton variant="ghost">
                                    Skip for now
                                </PaddockButton>
                                <PaddockButton variant="danger">
                                    Delete task
                                </PaddockButton>
                            </SpecimenRow>
                            <SpecimenRow label="Sizes">
                                <PaddockButton size="sm">Send</PaddockButton>
                                <PaddockButton size="md">
                                    Save changes
                                </PaddockButton>
                                <PaddockButton size="lg">
                                    Start writing
                                </PaddockButton>
                            </SpecimenRow>
                            <SpecimenRow label="Plain voice, disabled, link">
                                <PaddockButton variant="outline" voice="plain">
                                    Mark all read
                                </PaddockButton>
                                <PaddockButton disabled>
                                    Upgrade to Pro
                                </PaddockButton>
                                <PaddockLinkButton
                                    href="#forms"
                                    variant="outline"
                                >
                                    Go to forms
                                </PaddockLinkButton>
                            </SpecimenRow>
                            <div className="paddock-night flex flex-wrap items-center gap-3 rounded-paddock-card p-5">
                                <PaddockButton surface="night">
                                    Upgrade to Pro
                                </PaddockButton>
                                <PaddockButton
                                    variant="outline"
                                    voice="plain"
                                    surface="night"
                                >
                                    Manage billing
                                </PaddockButton>
                                <PaddockButton variant="ghost" surface="night">
                                    Not now
                                </PaddockButton>
                            </div>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Icon square"
                        usage="A 48px square for an action with a well-known icon. Every one needs a label, which becomes its accessible name. Counts sit in a lime badge."
                        components={["PaddockIconButton"]}
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="relative inline-flex">
                                <PaddockIconButton
                                    label="Notifications, 3 unread"
                                    icon={<Bell className="size-5" />}
                                />
                                <span
                                    aria-hidden="true"
                                    className="paddock-mono absolute -top-[7px] -right-[7px] flex h-5 min-w-5 items-center justify-center rounded-full bg-paddock-lime px-[5px] text-[0.6875rem] font-medium text-paddock-on-fill"
                                >
                                    3
                                </span>
                            </span>
                            <PaddockIconButton
                                label="Add a task to To do"
                                size="sm"
                                icon={<Plus className="size-5" />}
                            />
                            <PaddockIconButton
                                label="Close"
                                variant="primary"
                                icon={
                                    <X className="size-5" strokeWidth={2.6} />
                                }
                            />
                            <PaddockIconButton
                                label="Schedule"
                                variant="ghost"
                                icon={<CalendarClock className="size-5" />}
                            />
                        </div>
                    </Specimen>

                    <Specimen
                        title="Burger"
                        usage="Opens the full-screen menu. The short bar grows on hover or focus, and the bars cross while the menu is open. It reports aria-expanded and names the menu it controls."
                        components={["BurgerButton"]}
                    >
                        <div className="flex items-center gap-4">
                            <ShowcaseMenu currentId="actions" />
                            <p className="m-0 text-sm text-paddock-subtle">
                                Hover it, then open it.
                            </p>
                        </div>
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="forms"
                    eyebrow="Forms"
                    serif="Fill it"
                    heavy="in"
                    intro="Ink-bordered fields on sheet. Labels are tags and always visible; placeholders only give an example. Focus is a lime ring with an ink edge, so it shows on paper too."
                >
                    <Specimen
                        title="Input, textarea, select"
                        usage="Each field takes an id, which wires the label, hint and error. Errors are a sentence under the field, announced as they appear, never just a red border."
                        components={[
                            "PaddockInput",
                            "PaddockTextarea",
                            "PaddockSelect",
                        ]}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <PaddockInput
                                id="demo-name"
                                label="Workspace name"
                                placeholder="e.g. Halden Studio"
                                defaultValue="Halden Studio"
                            />
                            <PaddockInput
                                id="demo-email"
                                label="Invite by email"
                                type="email"
                                placeholder="name@company.com"
                                hint="They get a link that expires in 7 days."
                                autoComplete="email"
                            />
                            <PaddockInput
                                id="demo-slug"
                                label="Workspace address"
                                defaultValue="halden studio"
                                error="Use letters, numbers and dashes only, for example halden-studio."
                            />
                            <PaddockSelect
                                id="demo-role"
                                label="Role"
                                defaultValue="MEMBER"
                                options={[
                                    { value: "ADMIN", label: "Admin" },
                                    { value: "MEMBER", label: "Member" },
                                    { value: "GUEST", label: "Guest" },
                                ]}
                            />
                            <PaddockTextarea
                                id="demo-about"
                                label="About this workspace"
                                placeholder="What the team works on"
                                wrapperClassName="sm:col-span-2"
                            />
                        </div>
                    </Specimen>

                    <Specimen
                        title="Radio cards"
                        usage="For two or three weighty choices, like workspace visibility. Native radios underneath: arrow keys move, and the choice submits with the form. The chosen card fills with ink."
                        components={["RadioCardGroup"]}
                    >
                        <RadioCardGroup
                            name="demo-visibility"
                            legend="Workspace visibility"
                            defaultValue="PRIVATE"
                            options={[
                                {
                                    value: "PRIVATE",
                                    label: "Private",
                                    badge: "Restricted",
                                    description:
                                        "Only people you invite can see and open this workspace.",
                                },
                                {
                                    value: "PUBLIC",
                                    label: "Public",
                                    badge: "Open",
                                    description:
                                        "Anyone can find this workspace, join it and collaborate.",
                                },
                            ]}
                        />
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="surfaces"
                    eyebrow="Surfaces"
                    serif="Cut"
                    heavy="corners"
                    intro="Cards sit flat on a rule. Instead of a shadow, the signature card loses a corner; the raised part opposite the cut is a tab that can carry a label."
                >
                    <Specimen
                        title="Notched card"
                        usage="Bottom notch for content cards, top notch for small price or plan callouts. Tone follows the band it sits in. Keep labels in the tab to two words."
                        components={["NotchedCard"]}
                    >
                        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <NotchedCard tab="Documents">
                                <p className="m-0 text-lg font-bold">
                                    Launch plan
                                </p>
                                <p className="m-0 mt-1 text-sm text-paddock-subtle">
                                    Bottom notch on sheet.
                                </p>
                            </NotchedCard>
                            <NotchedCard
                                notch="top"
                                tone="paper"
                                tab="Free plan"
                                bodyClassName="flex flex-col items-center gap-2 text-center"
                            >
                                <span
                                    data-numeric
                                    className="paddock-mono text-[1.375rem] font-medium"
                                >
                                    $0
                                </span>
                                <Tag>forever</Tag>
                            </NotchedCard>
                            <NotchedCard tone="night" tab="Boards">
                                <p className="paddock-serif m-0 text-[2.5rem] leading-[0.9] text-paddock-lime">
                                    Instead
                                </p>
                                <p className="m-0 mt-2">
                                    The card lands once. No phantom duplicate.
                                </p>
                            </NotchedCard>
                            <NotchedCard tone="deep" tab="Chat">
                                <p className="paddock-heavy m-0 text-2xl leading-[0.96]">
                                    Three messages, no signal.
                                </p>
                            </NotchedCard>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Stat tile"
                        usage="A headline figure, server-rendered so it reads before any chart loads. Heavy numerals, serif unit, a one-line hint that says what the number means."
                        components={["PaddockStatTile"]}
                    >
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3.5">
                            <PaddockStatTile
                                label="Completion rate"
                                value="64"
                                unit="%"
                                hint="14 of 22 tasks done"
                            />
                            <PaddockStatTile
                                label="Median cycle"
                                value="2.4"
                                unit="d"
                                hint="From to do to done"
                            />
                            <PaddockStatTile
                                label="Messages"
                                value="312"
                                hint="In the last 7 days"
                            />
                        </div>
                    </Specimen>

                    <Specimen
                        title="Plan card"
                        usage="Plans side by side. The recommended plan sits on night, where lime can be text. Names, prices and limits come from the plan catalogue, never typed into the page."
                        components={["PlanCard"]}
                    >
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4">
                            <PlanCard
                                name="Free"
                                tagline="For small teams finding their rhythm."
                                price="$0"
                                cadence="forever"
                                current
                                features={[
                                    "Unlimited documents",
                                    "Up to 5 members",
                                    "7 days of analytics",
                                ]}
                            />
                            <PlanCard
                                name="Pro"
                                tagline="For teams that live in the workspace."
                                price="$12"
                                cadence="per month"
                                featured
                                features={[
                                    "Everything in Free",
                                    "Unlimited members",
                                    "90 days of analytics",
                                ]}
                                action={
                                    <PaddockButton surface="night">
                                        Upgrade to Pro
                                    </PaddockButton>
                                }
                            />
                        </div>
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="navigation"
                    eyebrow="Navigation"
                    serif="Find"
                    heavy="your way"
                    intro="Links between pages are links with aria-current; switches inside a page are tabs. The scribble marks where you are, but the text colour says it too."
                >
                    <Specimen
                        title="Workspace tabs"
                        usage="The section bar under the header. An ink scribble draws in on hover and focus and stays under the current page."
                        components={[
                            "WorkspaceTabs",
                            "AvatarStack",
                            "RolePill",
                        ]}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-paddock-rule px-1">
                            <WorkspaceTabs
                                label="Workspace sections (demo)"
                                items={WORKSPACE_TABS}
                            />
                            <span className="flex items-center gap-2.5">
                                <AvatarStack people={DEMO_TEAM} />
                                <RolePill role="ADMIN" />
                            </span>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Pill tabs"
                        usage="A two- or three-way switch over one panel, like My workspaces and Discover public. Arrow keys move between options; counts are real data, set in mono."
                        components={["PillTabs"]}
                    >
                        <PillTabsDemo />
                    </Specimen>

                    <Specimen
                        title="Menu overlay"
                        usage="Every destination at once. Opens as a circle from the burger, recent documents drift behind, items rise in sequence. Escape, the close square or any item closes it, and focus returns to the burger."
                        components={["MenuOverlay"]}
                    >
                        <div className="flex items-center gap-4">
                            <ShowcaseMenu currentId="navigation" />
                            <p className="m-0 text-sm text-paddock-subtle">
                                Navigation is marked current, with the squiggle.
                            </p>
                        </div>
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="people"
                    eyebrow="People"
                    serif="Who is"
                    heavy="here"
                    intro="People keep their colour everywhere: avatar, cursor flag, chat rail, highlight. Text on a person's colour is always the dark on-fill ink, in both themes."
                >
                    <Specimen
                        title="Avatar and stack"
                        usage="Round, filled with the person's hue. Mark it decorative when the name is written beside it. Stacks name everyone in one label and collapse the rest into a count."
                        components={["PaddockAvatar", "AvatarStack"]}
                    >
                        <div className="flex flex-col gap-6">
                            <SpecimenRow label="Sizes">
                                <PaddockAvatar
                                    person={DEMO_PEOPLE.maya}
                                    size="xs"
                                />
                                <PaddockAvatar
                                    person={DEMO_PEOPLE.theo}
                                    size="sm"
                                />
                                <PaddockAvatar
                                    person={DEMO_PEOPLE.priya}
                                    size="md"
                                />
                                <PaddockAvatar
                                    person={DEMO_PEOPLE.sam}
                                    size="lg"
                                />
                                <PaddockAvatar
                                    person={DEMO_PEOPLE.maya}
                                    size="xl"
                                />
                            </SpecimenRow>
                            <SpecimenRow label="Stacks">
                                <AvatarStack people={DEMO_TEAM} size="md" />
                                <AvatarStack
                                    people={DEMO_TEAM}
                                    size="sm"
                                    max={2}
                                />
                            </SpecimenRow>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Cursor flag and highlight"
                        usage="Where someone is typing, and what they are touching. The flag is visual; assistive tech hears the name once. The wash is 32% of their colour, so ink stays legible."
                        components={["CursorFlag", "CollaboratorHighlight"]}
                    >
                        <p className="m-0 rounded-paddock-card border border-paddock-rule bg-paddock-sheet px-6 pt-9 pb-6 text-[1.15625rem] leading-[1.7]">
                            We ship the new board view to every workspace{" "}
                            <CollaboratorHighlight person={DEMO_PEOPLE.maya}>
                                on 14 November
                            </CollaboratorHighlight>
                            <CursorFlag person={DEMO_PEOPLE.maya} blinking />.
                            Pro workspaces get 90 days of history the same day;{" "}
                            <CollaboratorHighlight person={DEMO_PEOPLE.theo}>
                                free workspaces keep 7
                            </CollaboratorHighlight>
                            <CursorFlag person={DEMO_PEOPLE.theo} />.
                        </p>
                    </Specimen>

                    <Specimen
                        title="Status, priority and role"
                        usage="None of these is a person, so none gets a hue. Status differs by outline and icon, priority by word (warning and danger only for high and urgent), role by fill."
                        components={["StatusPill", "PriorityLabel", "RolePill"]}
                    >
                        <div className="flex flex-col gap-6">
                            <SpecimenRow label="Status">
                                <StatusPill status="TODO" />
                                <StatusPill status="IN_PROGRESS" />
                                <StatusPill status="DONE" />
                            </SpecimenRow>
                            <SpecimenRow label="Priority">
                                <PriorityLabel priority="LOW" />
                                <PriorityLabel priority="MEDIUM" />
                                <PriorityLabel priority="HIGH" />
                                <PriorityLabel priority="URGENT" />
                            </SpecimenRow>
                            <SpecimenRow label="Role">
                                <RolePill role="ADMIN" />
                                <RolePill role="MEMBER" />
                                <RolePill role="GUEST" />
                            </SpecimenRow>
                        </div>
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="collaboration"
                    eyebrow="Collaboration"
                    serif="Work"
                    heavy="together"
                    intro="The editor's toolbar, the chat and the notification feed. Each one says who did what before it says anything else."
                >
                    <Specimen
                        title="Floating toolbar"
                        usage="Formatting for the editor, floating over the page. One tab stop; arrow keys move between tools. Active formats are lime fills and report aria-pressed."
                        components={["FloatingToolbar"]}
                    >
                        <div className="rounded-paddock-card border border-paddock-rule bg-paddock-sheet px-4 py-8">
                            <ToolbarDemo />
                        </div>
                    </Specimen>

                    <Specimen
                        title="Chat message and composer"
                        usage="Messages carry the author's rail and name flag; a run from one person shows the avatar once. The composer is pinned under a scrolling log: Enter sends, Shift and Enter adds a line, and the box grows with the text."
                        components={[
                            "ChatMessage",
                            "Mention",
                            "ChatComposer",
                            "ComposerTool",
                        ]}
                    >
                        <ChatDemo />
                    </Specimen>

                    <Specimen
                        title="Notification row"
                        usage="One row per notification, inside a list. Unread rows take a lime wash, a bold title and a dot, and say Unread to assistive tech. System notices get an ink tile in place of a face."
                        components={["NotificationRow"]}
                    >
                        <ul className="m-0 list-none overflow-hidden rounded-paddock-panel border border-paddock-rule p-0">
                            <NotificationRow
                                href="#collaboration"
                                actor={DEMO_PEOPLE.maya}
                                title="Maya mentioned you in Autumn launch plan"
                                body="“Sam, can you confirm the walkthrough slot?”"
                                time="4m"
                                dateTime="2026-10-23T09:20:00Z"
                                unread
                            />
                            <NotificationRow
                                href="#surfaces"
                                icon={<CalendarClock className="size-4.5" />}
                                title="Your Pro trial ends in 3 days"
                                body="Add a card to keep 90 days of analytics."
                                time="2h"
                                dateTime="2026-10-23T07:24:00Z"
                                unread
                            />
                            <NotificationRow
                                href="#people"
                                actor={DEMO_PEOPLE.theo}
                                title="Theo moved Fix drag on iPad split view to Done"
                                time="1d"
                                dateTime="2026-10-22T09:24:00Z"
                            />
                        </ul>
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="overlays"
                    eyebrow="Overlays"
                    serif="One thing"
                    heavy="at a time"
                    intro="A dialog interrupts, so it earns its shadow. The page behind stops scrolling and cannot take focus until the dialog closes."
                >
                    <Specimen
                        title="Dialog"
                        usage="For a focused task or a confirmation. Titled in both voices; the body scrolls inside while the header and actions stay put. Escape, the backdrop and the close square all close it, and focus goes back to the button that opened it."
                        components={["PaddockDialog"]}
                    >
                        <DialogDemo />
                    </Specimen>
                </ShowcaseSection>

                <ShowcaseSection
                    id="motion"
                    eyebrow="Motion"
                    serif="Things"
                    heavy="that move"
                    intro="The showcase demonstrates Paddock's motion as designed. Shipping it would break the current rule that motion only answers an action, which is recorded as an open decision. Everything here is still under reduced motion."
                    surface="night"
                >
                    <Specimen
                        title="Scribble"
                        usage="A hand-drawn lime stroke that draws itself in: once on load under a hero line, or on hover and focus under a link. Always decorative, never the only signal."
                        components={["Scribble"]}
                        surface="night"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex h-40 flex-col justify-between rounded-paddock-card bg-paddock-night-card p-5">
                                <Tag tone="night-subtle">Draws on load</Tag>
                                <Scribble
                                    shape="loop"
                                    delayMs={900}
                                    className="h-20 w-60"
                                />
                            </div>
                            <a
                                href="#motion"
                                className="group flex h-40 flex-col justify-between rounded-paddock-card bg-paddock-night-card p-5 no-underline"
                            >
                                <Tag tone="night-subtle">
                                    Draws on hover or focus
                                </Tag>
                                <span className="relative w-fit">
                                    <span className="paddock-heavy text-2xl">
                                        Hover this card
                                    </span>
                                    <Scribble
                                        shape="underline"
                                        trigger="hover"
                                        className="absolute -bottom-2 left-0 h-3 w-full"
                                    />
                                </span>
                            </a>
                        </div>
                    </Specimen>

                    <Specimen
                        title="Marquee"
                        usage="Two rows of display type running in opposite directions across a night band. It runs for longer than five seconds, so it carries a pause button. The duplicate copy that closes the loop is hidden from assistive tech."
                        components={["Marquee"]}
                        surface="night"
                    >
                        <div className="relative overflow-hidden rounded-paddock-card border border-paddock-night-rule py-8">
                            <Marquee
                                top={["nothing to resolve —", "no locks —"]}
                                bottom={[
                                    "documents · boards · chat ·",
                                    "every keystroke merged ·",
                                ]}
                                className="pb-16"
                            />
                        </div>
                    </Specimen>

                    <Specimen
                        title="Word reveal"
                        usage="A statement whose words brighten as they scroll into view. CSS only, and only where scroll-driven animation is supported and motion is welcome; everyone else reads the finished sentence."
                        components={["WordReveal"]}
                        surface="night"
                    >
                        <WordReveal
                            segments={[
                                { text: "Everyone keeps their" },
                                { text: "own colour", emphasis: true },
                                {
                                    text: "— on their cursor, their messages and their cards — so you always know",
                                },
                                { text: "who did what.", emphasis: true },
                            ]}
                        />
                    </Specimen>

                    <Specimen
                        title="Loader screen"
                        usage="A first-load curtain: the bar fills, then the screen lifts away. Decorative, hidden from assistive tech, and not drawn at all under reduced motion. Shown here in a frame, on demand."
                        components={["LoaderScreen"]}
                        surface="night"
                    >
                        <LoaderDemo />
                    </Specimen>
                </ShowcaseSection>
            </main>

            <footer className="border-t border-paddock-rule px-4 py-10 sm:px-6">
                <div className="mx-auto flex max-w-[77rem] flex-wrap items-center justify-between gap-4">
                    <Wordmark size="sm" />
                    <nav
                        aria-label="Design system versions"
                        className="flex gap-5"
                    >
                        <Link
                            href="/design-system"
                            className="paddock-tag text-[0.6875rem] no-underline hover:underline"
                        >
                            Current (v1)
                        </Link>
                        <a
                            href="#index"
                            className="paddock-tag text-[0.6875rem] no-underline hover:underline"
                        >
                            Back to the index
                        </a>
                    </nav>
                </div>
            </footer>
        </PaddockRoot>
    );
}
