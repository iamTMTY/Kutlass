"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "ghost",
  size = "md",
  icon,
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-1.5 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-violet-600 hover:bg-violet-500 text-white",
    ghost: "text-zinc-300 hover:text-white hover:bg-white/10",
    danger: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn(base, variants[variant], sizes[size], className)}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
      title={props.title}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
