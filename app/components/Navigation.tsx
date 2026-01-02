'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavUser {
  username: string;
  role: string;
}

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const verifyAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.valid) {
          setUser({ username: data.user.username, role: data.user.role });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  // Monitorar mudanças de pathname para detectar logout
  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setUser(null);
    } else {
      verifyAuth();
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/dashboard', label: '🏠 Dashboard', requiresAuth: true },
    { path: '/stats', label: '📊 Estatísticas', requiresAuth: true },
    { path: '/admin/give-items', label: '🎁 Dar Itens', requiresAuth: true, adminOnly: true },
    { path: '/users', label: '👥 Usuários', requiresAuth: true, adminOnly: true },
  ];

  return (
    <>
      {/* Ocultar navigation em páginas de autenticação */}
      {user && (
        <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="text-2xl">🎮</div>
                <span className="font-bold text-xl hidden sm:inline">Palworld Admin</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  (!item.adminOnly || user?.role === 'admin') && (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`px-3 py-2 rounded-lg transition ${
                        isActive(item.path)
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-sm text-gray-400">
                  {user.username}
                  {user.role === 'admin' && <span className="text-orange-400 ml-2">👑</span>}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm"
                >
                  Sair
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
              <div className="md:hidden mt-4 border-t border-gray-700 pt-4 space-y-2">
                {navItems.map((item) => (
                  (!item.adminOnly || user?.role === 'admin') && (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        isActive(item.path)
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
