import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';

/* Page transition wrapper */
function PageTransition() {
  const location = useLocation();
  const ref       = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('page-enter-active');
    /* force reflow */
    void el.offsetWidth;
    el.classList.add('page-enter-active');
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-transition">
      <Outlet />
    </div>
  );
}

export default function Layout() {
  return (
    <>
      <ScrollRestoration />
      <Header />
      <main className="page">
        <PageTransition />
      </main>
      <Footer />
    </>
  );
}
