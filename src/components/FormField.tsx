import { labelClass } from "@/lib/styles";
import { ReactNode } from "react";

export function FormField({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `space-y-1 ${className}` : "space-y-1"}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
