export const ROLE = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    COMPANY_ADMIN: 'COMPANY_ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    CUSTOMER: 'CUST',
  } as const;

export type ROLE = typeof ROLE[keyof typeof ROLE];
  