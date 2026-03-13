import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
    // Also scroll window just in case
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
