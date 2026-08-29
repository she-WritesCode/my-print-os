"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

function SheetOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = cva(
  "fixed z-50 flex flex-col bg-[#FAF7F2] dark:bg-[#120A0D] text-[#181113] dark:text-[#FBF6F0] shadow-2xl transition ease-in-out data-open:animate-in data-closed:animate-out data-open:duration-300 data-closed:duration-200 outline-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-[#EADDCF] dark:border-[#2E1C23] data-closed:slide-out-to-top data-open:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t border-[#EADDCF] dark:border-[#2E1C23] data-closed:slide-out-to-bottom data-open:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-[#EADDCF] dark:border-[#2E1C23] data-closed:slide-out-to-left data-open:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-full border-l border-[#EADDCF] dark:border-[#2E1C23] data-closed:slide-out-to-right data-open:slide-in-from-right sm:max-w-md md:max-w-lg",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends DialogPrimitive.Popup.Props,
    VariantProps<typeof sheetVariants> {
  children?: React.ReactNode
}

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 h-full max-h-screen",
          sheetVariants({ side }),
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          data-slot="sheet-close"
          className="absolute top-4 right-4 z-10 rounded-lg p-1.5 text-[#6E5F64] dark:text-[#A8949A] hover:text-[#181113] dark:hover:text-white hover:bg-[#F4EDE4] dark:hover:bg-[#24151B] transition-colors focus:outline-none cursor-pointer"
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col space-y-1 text-left", className)}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-bold text-[#181113] dark:text-[#FBF6F0]", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-xs text-[#6E5F64] dark:text-[#A8949A]", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
