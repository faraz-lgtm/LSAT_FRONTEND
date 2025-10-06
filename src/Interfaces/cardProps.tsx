import type { ReactNode } from "react";

export type CardProps = {
  title: string;
  // image:string;
  description?: string;
  footer?: ReactNode;   // buttons, actions
  extra?: ReactNode;    // tags, badges, etc.
  children?: ReactNode; // custom slot (optional)
};