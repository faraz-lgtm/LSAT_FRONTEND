import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const contactsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(""),
  status: z.array(z.string()).optional().catch([]),
});

// Lazy load ContactsPage to enable code splitting
const ContactsPage = lazy(() => import("@/features/dashboardRelated/users/pages/contacts").then((m) => ({ default: m.ContactsPage })));

export const Route = createFileRoute("/_authenticated/users/contacts")({
  validateSearch: contactsSearchSchema,
  component: ContactsPage,
});


