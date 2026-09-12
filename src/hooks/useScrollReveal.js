import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, the class "revealed" is added.
 * Use with CSS:  .reveal { opacity:0; transform:translateY(30px); transition:... }
 *                .reveal.revealed { opacity:1; transform:none; }
 *
 * @param {object} options
 * @param {number} options.threshold  — 0–1, default 0.12
 * @param {string} options.rootMargin — default '0px 0px -60px 0px'
 */
export default function useScrollReveal({ threshold = 0.12, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);   // fire once
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
