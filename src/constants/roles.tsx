export const ROLE = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    CUSTOMER: 'CUST',
  } as const;

export type ROLE = typeof ROLE[keyof typeof ROLE];
  