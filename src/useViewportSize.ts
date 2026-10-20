import { useEffect } from 'react';

// Mobile keyboards can resize the visual viewport without changing layout height.
export function useViewportSize() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      const keyboardViewport = viewport && viewport.scale === 1;
      root.style.setProperty('--j-viewport-height', (keyboardViewport ? viewport.height : window.innerHeight) + 'px');
      root.style.setProperty('--j-viewport-top', (keyboardViewport ? viewport.offsetTop : 0) + 'px');
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('resize', schedule);
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      root.style.removeProperty('--j-viewport-height');
      root.style.removeProperty('--j-viewport-top');
    };
  }, []);
}
