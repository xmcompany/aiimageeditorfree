"use client";

import { cn } from "@/shared/lib/utils";
import { type ComponentProps, memo } from "react";
import dynamic from "next/dynamic";
const Streamdown = dynamic(() => import("./streamdown-wrapper"), { ssr: false });

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";