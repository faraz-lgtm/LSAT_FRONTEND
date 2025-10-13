import { ROLE } from '@/constants/roles'
import { Shield, UserCheck, Users } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300']
])

export const roles = [
  {
    label: ROLE.ADMIN,
    value: "admin",
    icon: Shield,
  },
  {
    label: ROLE.USER,
    value: "user",
    icon: UserCheck,
  },
  {
    label: "CUSTOMER",
    value: "customer",
    icon: Users,
  },
  // {
  //   label: 'Cashier',
  //   value: 'cashier',
  //   icon: CreditCard,
  // },
] as const
