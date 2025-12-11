import { ROLE } from "@/constants/roles";
import type { RootState } from "@/redux/store";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export function Organizations() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = user?.roles?.includes(ROLE.SUPER_ADMIN) || (user?.roles as string[])?.includes('SUPER_ADMIN');

  // Redirect if not SUPER_ADMIN - this route is deprecated, use /super-admin instead
  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate({ to: '/errors/403' });
    } else if (user && isSuperAdmin) {
      // Redirect super admin to the new dashboard
      navigate({ to: '/super-admin' });
    }
  }, [user, isSuperAdmin, navigate]);

  // Don't render - redirect handled in useEffect
  return null;
}

