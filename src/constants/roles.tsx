export const ROLE = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
  } as const;

export type ROLE = typeof ROLE[keyof typeof ROLE];
  