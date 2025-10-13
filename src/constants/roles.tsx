export const ROLE = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUST',
  } as const;

export type ROLE = typeof ROLE[keyof typeof ROLE];
  