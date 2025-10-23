// paste this code in console to go to mimic order dates are old and see what happens

// 1. Check current cart data
const persistData = JSON.parse(localStorage.getItem('persist:root'));
const cartData = JSON.parse(persistData.cart);
console.log('Current cart:', cartData);

// 2. Simulate expired slots (run this separately)
const persistData2 = JSON.parse(localStorage.getItem('persist:root'));
const cartData2 = JSON.parse(persistData2.cart);

// Set slots to yesterday (expired) - 5 slots
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

cartData2.items[0].DateTime = [
  new Date(yesterday.setHours(10, 0, 0, 0)).toISOString(), // Yesterday 10 AM
  new Date(yesterday.setHours(11, 0, 0, 0)).toISOString(), // Yesterday 11 AM
  new Date(yesterday.setHours(12, 0, 0, 0)).toISOString(), // Yesterday 12 PM
  new Date(yesterday.setHours(13, 0, 0, 0)).toISOString(), // Yesterday 1 PM
  new Date(yesterday.setHours(14, 0, 0, 0)).toISOString()  // Yesterday 2 PM
];

// Save back to localStorage
persistData2.cart = JSON.stringify(cartData2);
localStorage.setItem('persist:root', JSON.stringify(persistData2));

console.log('✅ 5 expired slots set! Refresh page and navigate to appointments.');