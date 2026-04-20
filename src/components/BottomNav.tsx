import type { ReactNode } from 'react';
import { toHash, type RouteId } from '../routing';

const icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  saved: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

const Tab = ({
  icon,
  active,
  onClick,
}: {
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button className={active ? 'navBtn navBtn--active' : 'navBtn'} onClick={onClick} aria-label="tab">
      <span className="iconWrapper">{icon}</span>
    </button>
  );
};

export function BottomNav({ active }: { active: RouteId }) {
  return (
    <nav className="bottomNav">
      <Tab icon={icons.home} active={active === 'home'} onClick={() => (window.location.hash = toHash({ id: 'home' }))} />
      <Tab icon={icons.search} active={active === 'search'} onClick={() => (window.location.hash = toHash({ id: 'search' }))} />
      <Tab icon={icons.saved} active={active === 'saved'} onClick={() => (window.location.hash = toHash({ id: 'saved' }))} />
    </nav>
  );
}
