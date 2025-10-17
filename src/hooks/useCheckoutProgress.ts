import { useLocation } from 'react-router-dom';

export function useCheckoutProgress(): 1 | 2 | 3 | 4 | 5 {
  const location = useLocation();
  // const { items } = useSelector((state: RootState) => state.cart);
  
  // Determine step based on location and state
  if (location.pathname === '/' || location.pathname.includes('home')) {
    return 1; // Home page is always step 1 (Select Items)
  }
  
  if (location.pathname === '/cart') {
    return 2; // Cart page is always step 2 (Review Cart)
  }
  
  if (location.pathname.includes('appointment')) {
    // For appointment page, we'll need to get the current selected tab
    // This will be handled by the appointment page component
    return 3; // Default to step 3 (Your Info)
  }
  
  return 1;
}

export default useCheckoutProgress;
