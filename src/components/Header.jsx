import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiChevronDown, HiMenu, HiX, HiOutlineCog, HiOutlineLogout, HiOutlineUserCircle } from 'react-icons/hi';
import { TbBrain, TbBook, TbCpu, TbRocket, TbShieldCheck, TbMail } from 'react-icons/tb';
import { useAuth } from '../contexts/AuthContext';
import TrialProgressBar from './ui/TrialProgressBar';

const NavItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={`flex items-center gap-1 py-8 text-[15px] font-medium transition-colors duration-150 ${isOpen ? 'text-[#6300ff]' : 'text-[#111]'}`}>
        {title}
        <HiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#6300ff]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[76px] w-80 rounded-lg border border-gray-200 bg-white p-3 z-50">
          <div className="flex flex-col gap-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownLink = ({ icon: Icon, title, description, to, onClick }) => (
  <Link to={to} onClick={onClick} className="group flex items-start gap-3.5 rounded-md p-2.5 transition-colors hover:bg-gray-50">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-gray-600 transition-colors group-hover:border-[#6300ff]/20 group-hover:bg-[#6300ff]/5 group-hover:text-[#6300ff]">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-[14px] font-medium text-gray-900 transition-colors group-hover:text-[#6300ff]">
        {title}
      </span>
      <span className="text-[12px] text-gray-500 font-normal leading-normal">
        {description}
      </span>
    </div>
  </Link>
);

const MobileNavItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 text-[16px] font-medium text-[#111]"
      >
        {title}
        <HiChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#6300ff]' : ''}`} />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 pb-3 pl-1">
          {children}
        </div>
      )}
    </div>
  );
};

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
      >
        <div className="w-8 h-8 rounded-full bg-[#6300ff] flex items-center justify-center text-white text-[13px] font-medium shrink-0">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left min-w-0">
          <span className="text-[14px] font-medium text-gray-900 truncate max-w-[140px] leading-tight">
            {user?.name || 'Usuario'}
          </span>
          <span className="text-[11px] text-gray-400 truncate max-w-[140px] leading-tight">
            {user?.email || ''}
          </span>
        </div>
        <HiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 z-50">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-[13px] font-medium text-gray-900 truncate">{user?.name || 'Usuario'}</p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email || ''}</p>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { setIsOpen(false); navigate('/dashboard'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <HiOutlineUserCircle size={16} className="text-gray-400" />
              Dashboard
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/dashboard?view=configuracoes'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <HiOutlineCog size={16} className="text-gray-400" />
              Configuracoes
            </button>
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] text-red-500 hover:bg-red-50 transition-colors"
            >
              <HiOutlineLogout size={16} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileAuthenticatedMenu({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6300ff] flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-medium text-gray-900 truncate">{user?.name || 'Usuario'}</span>
            <span className="text-[12px] text-gray-400 truncate">{user?.email || ''}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <HiX className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-col py-4 flex-1">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="py-3 text-[16px] font-medium text-[#111] border-b border-gray-100"
        >
          Dashboard
        </Link>
        <Link
          to="/dashboard?view=configuracoes"
          onClick={onClose}
          className="py-3 text-[16px] font-medium text-[#111] border-b border-gray-100"
        >
          Configuracoes
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full text-center rounded border border-red-200 py-3 text-[15px] font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default function HeaderZelt() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full font-sans antialiased bg-white border-b border-gray-200">
        <div className="w-full bg-[#6300ff] py-2 px-4 text-center text-xs sm:text-sm font-medium text-white">
          {isAuthenticated ? (
            <span>
              Bem-vindo de volta, <span className="font-semibold">{user?.name?.split(' ')[0] || 'usuario'}</span>. Seu WhatsApp esta ativo e pronto para atender.
            </span>
          ) : (
            <Link to="/register" className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <span>Zelt.AI Beta: Seja um dos primeiros a automatizar seu WhatsApp com IA</span>
              <span className="underline underline-offset-2 font-semibold">Garantir vaga</span>
            </Link>
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">

            <div className="flex shrink-0 items-center">
              <Link to={isAuthenticated ? '/dashboard' : '/'}>
                <img src="banner.png" alt="Zelt.AI" className="h-11 w-auto object-contain" />
              </Link>
            </div>

            {!isAuthenticated ? (
              <>
                <nav className="hidden md:flex items-center gap-7">
                  <NavItem title="Produto">
                    <DropdownLink title="Visao Geral" description="Conheca a plataforma completa." icon={TbBrain} to="/product" />
                    <DropdownLink title="Enterprise" description="Solucoes para grandes operacoes." icon={TbRocket} to="/enterprise" />
                    <DropdownLink title="Integracoes" description="Conecte seus sistemas favoritos." icon={TbCpu} to="/integrations" />
                  </NavItem>

                  <Link to="/clients" className="text-[15px] font-medium text-[#111] hover:text-[#6300ff] transition-colors py-8">
                    Clientes
                  </Link>

                  <Link to="/pricing" className="text-[15px] font-medium text-[#111] hover:text-[#6300ff] transition-colors py-8">
                    Precos
                  </Link>

                  <Link to="/resources" className="text-[15px] font-medium text-[#111] hover:text-[#6300ff] transition-colors py-8">
                    Recursos
                  </Link>

                  <NavItem title="Empresa">
                    <DropdownLink title="Sobre Nos" description="Nossa missao e valores." icon={TbRocket} to="/about" />
                    <DropdownLink title="Contato" description="Fale com nosso time." icon={TbMail} to="/contact" />
                    <DropdownLink title="Privacidade" description="Como tratamos seus dados." icon={TbShieldCheck} to="/privacy" />
                    <DropdownLink title="Termos de Uso" description="Contrato de uso da plataforma." icon={TbBook} to="/terms" />
                  </NavItem>
                </nav>

                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/login" className="rounded border border-gray-200 px-5 py-2.5 text-[15px] font-medium text-black hover:bg-gray-50 hover:border-gray-300 transition-colors">
                      Entrar
                    </Link>
                    <Link to="/register" className="rounded bg-[#111] px-5 py-2.5 text-[15px] font-medium text-white hover:bg-black transition-colors">
                      Teste gratis
                    </Link>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden hover:bg-gray-50"
                  >
                    <HiMenu className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="rounded border border-gray-200 px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <TrialProgressBar className="hidden md:flex" />
                  <UserMenu />
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden hover:bg-gray-50"
                >
                  <HiMenu className="h-6 w-6" />
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white p-6 border-l border-gray-200 flex flex-col justify-between overflow-y-auto">
            {isAuthenticated ? (
              <MobileAuthenticatedMenu onClose={() => setIsMobileMenuOpen(false)} />
            ) : (
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <img src="banner.png" alt="Zelt.AI" className="h-9 w-auto object-contain" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-4 flex flex-col">
                  <MobileNavItem title="Produto">
                    <DropdownLink title="Visao Geral" description="Conheca a plataforma completa." icon={TbBrain} to="/product" onClick={() => setIsMobileMenuOpen(false)} />
                    <DropdownLink title="Enterprise" description="Solucoes para grandes operacoes." icon={TbRocket} to="/enterprise" onClick={() => setIsMobileMenuOpen(false)} />
                    <DropdownLink title="Integracoes" description="Conecte seus sistemas favoritos." icon={TbCpu} to="/integrations" onClick={() => setIsMobileMenuOpen(false)} />
                  </MobileNavItem>

                  <Link to="/clients" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100 py-4 text-[16px] font-medium text-[#111]">
                    Clientes
                  </Link>

                  <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100 py-4 text-[16px] font-medium text-[#111]">
                    Precos
                  </Link>

                  <Link to="/resources" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-gray-100 py-4 text-[16px] font-medium text-[#111]">
                    Recursos
                  </Link>

                  <MobileNavItem title="Empresa">
                    <DropdownLink title="Sobre Nos" description="Nossa missao e valores." icon={TbRocket} to="/about" onClick={() => setIsMobileMenuOpen(false)} />
                    <DropdownLink title="Contato" description="Fale com nosso time." icon={TbMail} to="/contact" onClick={() => setIsMobileMenuOpen(false)} />
                    <DropdownLink title="Privacidade" description="Como tratamos seus dados." icon={TbShieldCheck} to="/privacy" onClick={() => setIsMobileMenuOpen(false)} />
                    <DropdownLink title="Termos de Uso" description="Contrato de uso da plataforma." icon={TbBook} to="/terms" onClick={() => setIsMobileMenuOpen(false)} />
                  </MobileNavItem>
                </nav>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-gray-100">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded border border-gray-200 py-3 text-[15px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Entrar
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded bg-[#111] py-3 text-[15px] font-medium text-white hover:bg-black transition-colors">
                  Teste gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="h-[116px] sm:h-[120px]" />
    </>
  );
}
