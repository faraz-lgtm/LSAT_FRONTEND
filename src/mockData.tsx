/* let's make dummy call to backend

so in the backend we will receive this sort of Data.

we will get all cart details along with the date & time selected for each item and totalPrice.

it will store that in order DB and process payment on basis of that. */
import type { Product } from "./Interfaces/product"

type ItemsType = Product & {
  appointment: {
    date: string;
    time: string;
  };
};

type CustomerDetails = {
  name: string;
  email: string;
  phoneNum: string;
};

export type mockDataType ={
        items:[ItemsType],
        customerDetails:CustomerDetails
}

// mock Data is something we will send
