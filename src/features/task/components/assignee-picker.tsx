"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";

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
}

export function AssigneePicker({
    members,
    selectedMemberId,
    onChange,
    name = "assigneeId",
    disabled = false,
    className,
}: AssigneePickerProps) {
    const selectedMember = members.find((m) => m.id === selectedMemberId);

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <div className="relative flex items-center">
                {selectedMember && (
                    <div className="absolute left-2.5 pointer-events-none z-10 flex items-center">
                        <UserAvatar user={selectedMember.user} size="sm" />
                    </div>
                )}
                <select
                    name={name}
                    value={selectedMemberId ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange?.(val === "" ? null : val);
                    }}
                    disabled={disabled}
                    className={cn(
                        "w-full bg-brand-surface text-brand-ink text-sm border-2 border-brand-ink rounded-brand py-2 pr-8 font-brand-sans focus:outline-none focus:ring-2 focus:ring-brand-accent transition-colors disabled:opacity-50 cursor-pointer appearance-none",
                        selectedMember ? "pl-11" : "pl-3",
                    )}
                    aria-label="Assign task to member"
                >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.user.name ||
                                member.user.email ||
                                "Unnamed Member"}{" "}
                            ({member.role})
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-brand-subtle text-xs">
                    ▼
                </div>
            </div>
        </div>
    );
}
