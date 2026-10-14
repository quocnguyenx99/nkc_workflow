import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
const HomePage = lazy(() => import('@/pages/HomePage'));
const NhapLieuPage = lazy(() => import('@/pages/NhapLieuPage'));
const BaoCaoPage = lazy(() => import('@/pages/BaoCaoPage'));
const GiaoDienPage = lazy(() => import('@/pages/GiaoDienPage'));

const TITLES: Record<string, string> = {
  '/': 'OneFlow – Trang chủ',
  '/nhap-lieu': 'OneFlow – Nhập liệu & Tính toán',
  '/bao-cao': 'OneFlow – Báo cáo & Phê duyệt',
  '/giao-dien': 'OneFlow – Giao diện Desktop & Mobile',
};

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] ?? 'NKC OneFlow';
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollManager />
      <Suspense fallback={<div className="min-h-screen bg-soft" />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nhap-lieu" element={<NhapLieuPage />} />
        <Route path="/bao-cao" element={<BaoCaoPage />} />
        <Route path="/giao-dien" element={<GiaoDienPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </MotionConfig>
  );
}
