"use client";

import { ChevronDown } from "lucide-react";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { paddockFieldClasses } from "@/components/paddock/paddock-styles";
import { cn } from "@/lib/cn";
import { WORKSPACE_ROLE_LABELS, type WorkspaceRole } from "@/schemas/workspace";

export interface MemberOption {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export interface AssigneePickerProps {
    members: MemberOption[];
    selectedMemberId: string | null;
    onChange?: (memberId: string | null) => void;
    name?: string;
    disabled?: boolean;
    className?: string;
    /** Set when a visible `<label htmlFor>` names the select; otherwise it labels itself. */
    id?: string;
}

function isWorkspaceRole(role: string): role is WorkspaceRole {
    return role in WORKSPACE_ROLE_LABELS;
}

function memberName(member: MemberOption): string {
    return member.user.name || member.user.email || "Unnamed member";
}

/**
 * A native select (the platform picker is the accessible one on every device)
 * with the chosen person's avatar set inside it, so the field shows *who* in
 * their own colour before you read the name.
 */
export function AssigneePicker({
    members,
    selectedMemberId,
    onChange,
    name = "assigneeId",
    disabled = false,
    className,
    id,
}: AssigneePickerProps) {
    const selectedMember = members.find((m) => m.id === selectedMemberId);

    return (
        <div className={cn("relative flex items-center", className)}>
            {selectedMember && (
                <span className="pointer-events-none absolute left-3 z-10 flex items-center">
                    <PaddockAvatar
                        person={{
                            id: selectedMember.user.id,
                            name: memberName(selectedMember),
                            image: selectedMember.user.image,
                        }}
                        size="sm"
                        decorative
                    />
                </span>
            )}
            <select
                id={id}
                name={name}
                value={selectedMemberId ?? ""}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange?.(val === "" ? null : val);
                }}
                disabled={disabled}
                aria-label={id ? undefined : "Assign task to member"}
                className={cn(
                    paddockFieldClasses,
                    "h-13 cursor-pointer appearance-none pr-10",
                    selectedMember ? "pl-12" : "pl-4",
                )}
            >
                <option value="">Unassigned</option>
                {members.map((member) => (
                    <option key={member.id} value={member.id}>
                        {isWorkspaceRole(member.role)
                            ? `${memberName(member)} · ${WORKSPACE_ROLE_LABELS[member.role]}`
                            : memberName(member)}
                    </option>
                ))}
            </select>
            <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3.5 size-4 text-paddock-ink"
                strokeWidth={2.2}
            />
        </div>
    );
}
