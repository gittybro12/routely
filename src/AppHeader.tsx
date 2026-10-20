import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Menu, MessageCircle, Moon, Sun, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useThemeMode } from './ThemeContext';

interface AppHeaderProps {
  page: string;
  plannerHref: string;
  onNavigate: (path: string) => void;
  onOpenHelper: (returnFocusTo: HTMLButtonElement | null) => void;
}

export default function AppHeader({ page, plannerHref, onNavigate, onOpenHelper }: AppHeaderProps) {
  const { mode, toggleMode } = useThemeMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const frame = requestAnimationFrame(() => navigation.current?.querySelector('a')?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const closeOnDesktop = () => { if (!media.matches) setMenuOpen(false); };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);

  function follow(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMenuOpen(false);
    onNavigate(path);
  }

  function openHelper(event: MouseEvent<HTMLButtonElement>) {
    const returnFocusTo = menuOpen ? menuButton.current : event.currentTarget;
    setMenuOpen(false);
    onOpenHelper(returnFocusTo);
  }

  return <header className="journey-header" ref={header}>
    <a className="journey-brand" href="/" aria-label="Routely home" onClick={(event) => follow(event, '/')}>
      <span className="journey-brand-mark"><BrandLogo size={24} /></span>
      <span><strong>Routely</strong><small>ABUJA JOURNEYS</small></span>
    </a>
    <nav id="journey-navigation" className={'journey-navigation' + (menuOpen ? ' is-open' : '')} aria-label="Main navigation" ref={navigation}>
      <a href={plannerHref} aria-current={page === '/planner' ? 'page' : undefined} onClick={(event) => follow(event, plannerHref)}>Planner</a>
      <a href="/coverage" aria-current={page === '/coverage' ? 'page' : undefined} onClick={(event) => follow(event, '/coverage')}>Coverage & data</a>
      <button type="button" className="journey-mobile-helper" onClick={openHelper}><MessageCircle size={20} /> Journey helper</button>
    </nav>
    <div className="journey-header-actions">
      <button type="button" className="journey-helper-button" onClick={openHelper} aria-label="Open journey helper" title="Journey helper"><MessageCircle size={20} /><span>Journey helper</span></button>
      <button type="button" className="journey-icon-button" onClick={toggleMode} aria-label={mode === 'dark' ? 'Use light theme' : 'Use dark theme'}>{mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
      <button type="button" className="journey-icon-button journey-menu-button" ref={menuButton} aria-expanded={menuOpen} aria-controls="journey-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
  </header>;
}
