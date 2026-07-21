"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetClose({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="sheet-overlay"
            className={cn(
                "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
                className,
            )}
            {...props}
        />
    );
}

const SIDE_CLASSES = {
    top: "inset-x-0 top-0 border-b data-open:slide-in-from-top data-closed:slide-out-to-top",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-xs border-r data-open:slide-in-from-left data-closed:slide-out-to-left",
} as const;

function SheetContent({
    className,
    children,
    side = "left",
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    side?: keyof typeof SIDE_CLASSES;
    showCloseButton?: boolean;
}) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Content
                data-slot="sheet-content"
                className={cn(
                    "fixed z-50 flex flex-col gap-4 bg-popover p-4 text-popover-foreground shadow-lg outline-none duration-150",
                    SIDE_CLASSES[side],
                    className,
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close data-slot="sheet-close" asChild>
                        <Button
                            variant="ghost"
                            className="absolute top-2 right-2"
                            size="icon-sm"
                        >
                            <XIcon />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </SheetPortal>
    );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-header"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    );
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="sheet-title"
            className={cn(
                "font-heading text-base leading-none font-medium",
                className,
            )}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetTrigger,
    SheetPortal,
    SheetClose,
    SheetOverlay,
    SheetContent,
    SheetHeader,
    SheetTitle,
};
