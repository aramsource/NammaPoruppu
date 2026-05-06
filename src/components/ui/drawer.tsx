"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root shouldScaleBackground={false} {...props} />;
}

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      className={`fixed inset-0 z-[900] bg-black/40 ${className ?? ""}`}
      {...props}
    />
  );
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      {/* Outer centering wrapper - full-width on mobile, centered max-w on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-[910] flex justify-center">
        <DrawerPrimitive.Content
          className={`relative flex w-full flex-col rounded-t-2xl bg-white outline-none sm:max-w-lg sm:rounded-t-3xl ${className ?? ""}`}
          style={{ maxHeight: "88dvh" }}
          {...props}
        >
          <div className="mx-auto mt-3 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-slate-200" />
          {children}
        </DrawerPrimitive.Content>
      </div>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`shrink-0 px-5 pb-3 pt-1 ${className ?? ""}`} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={`text-xl font-bold text-slate-900 ${className ?? ""}`}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      className={`text-sm text-slate-500 ${className ?? ""}`}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mt-auto flex flex-col gap-2 p-4 ${className ?? ""}`} {...props} />;
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
