import { motion, type HTMLMotionProps } from 'motion/react';

/** Fade/slide-up khi vào viewport. `i` = vị trí trong nhóm → stagger 80ms. */
export function Reveal({ i = 0, ...props }: HTMLMotionProps<'div'> & { i?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
      {...props}
    />
  );
}
