import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';

const NAV_ITEMS = [
  { label: 'Giải pháp', href: '#diem-nghen', id: 'diem-nghen' },
  { label: 'Luồng dữ liệu', href: '#workflow', id: 'workflow' },
  { label: 'Phòng ban', href: '#so-do', id: 'so-do' },
  { label: 'Quy trình', href: '#quy-trinh', id: 'quy-trinh' },
];

export function HomeNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const ids = ['home', ...NAV_ITEMS.map((item) => item.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: [0, 0.1, 0.3] },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`home-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="home-shell home-nav__inner">
        <a href="#home" className="home-nav__brand" onClick={closeMenu}>
          <BrandMark />
        </a>

        <nav className="home-nav__links" aria-label="Điều hướng trang chủ">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={item.href} className={active === item.id ? 'is-active' : ''}>
              {item.label}
              {active === item.id && <motion.span layoutId="home-nav-active" className="home-nav__active" />}
            </a>
          ))}
          <Link to="/bao-cao">Báo cáo</Link>
        </nav>

        <div className="home-nav__actions">
          <Link to="/nhap-lieu" className="home-button home-button--nav">
            Vào demo <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            ref={triggerRef}
            type="button"
            className="home-nav__menu-button"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            aria-controls="home-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              className="home-nav__backdrop"
              aria-label="Đóng menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.nav
              id="home-mobile-menu"
              className="home-nav__mobile"
              aria-label="Điều hướng trang chủ trên di động"
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0 round 0 0 20px 20px)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0 round 0 0 20px 20px)' }}
              exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0 round 0 0 20px 20px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {NAV_ITEMS.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className={active === item.id ? 'is-active' : ''}
                  onClick={closeMenu}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + index * 0.035 }}
                >
                  <span className="home-nav__mobile-index">0{index + 1}</span>
                  {item.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </motion.a>
              ))}
              <Link to="/bao-cao" onClick={closeMenu}>
                <span className="home-nav__mobile-index">05</span>
                Báo cáo
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
