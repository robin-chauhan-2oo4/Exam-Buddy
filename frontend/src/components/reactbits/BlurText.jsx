import { useRef, useEffect, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

export default function BlurText({
  text = '',
  delay = 0.05,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  onAnimationComplete
}) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: rootMargin, amount: threshold });
  const controls = useAnimation();

  const defaultFrom = useMemo(() => {
    const base = { filter: 'blur(10px)', opacity: 0 };
    if (direction === 'top') return { ...base, y: -30 };
    if (direction === 'bottom') return { ...base, y: 30 };
    if (direction === 'left') return { ...base, x: -30 };
    if (direction === 'right') return { ...base, x: 30 };
    return base;
  }, [direction]);

  const defaultTo = useMemo(() => ({
    filter: 'blur(0px)',
    opacity: 1,
    y: 0,
    x: 0
  }), []);

  const fromState = animationFrom || defaultFrom;
  const toState = animationTo || defaultTo;

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);

  return (
    <span ref={ref} className={className} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          custom={index}
          initial={fromState}
          animate={controls}
          variants={{
            visible: {
              ...toState,
              transition: {
                duration: 0.5,
                delay: index * delay,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }
          }}
          style={{
            display: 'inline-block',
            willChange: 'transform, filter, opacity'
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </span>
  );
}
