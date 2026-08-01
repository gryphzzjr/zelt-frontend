import { useState, useEffect, useRef, forwardRef } from 'react';

export function useInView(threshold = 0.2) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export const FadeUp = forwardRef(function FadeUp({ delay = 0, show, children, className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`anim-fade-up ${show ? 'show' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});

export function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView(0.12);
  return (
    <FadeUp ref={ref} delay={delay} show={inView} className={className}>
      {children}
    </FadeUp>
  );
}
