import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect old /super-admin/dashboard route to /super-admin
export const Route = createFileRoute("/_authenticated/super-admin/dashboard")({
  beforeLoad: () => {
    throw redirect({
      to: '/super-admin',
    })
  },
});
