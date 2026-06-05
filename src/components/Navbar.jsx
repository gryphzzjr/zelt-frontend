import { useState, useEffect, useRef } from "react";
import { Menu, X, LayoutDashboard, LogOut, User, ShieldCheck, XIcon } from "lucide-react";

const NAV_LINKS = [
  { name: "Recursos", href: "/recursos" },
  { name: "Depoimentos", href: "/depoimentos" },
  { name: "Preços", href: "/precos" },
  { name: "Contato", href: "/contato" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", plan: "" });
  const menuRef = useRef(null);
  const pathname = window.location.pathname;

  const userInitials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };

    const token = localStorage.getItem("zelt_token");
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const stored = JSON.parse(localStorage.getItem("zelt_user") || "{}");
        setUser({
          name: stored.name || stored.nome || "",
          email: stored.email || "",
          plan: stored.plan_type
            ? `Plano ${stored.plan_type.charAt(0).toUpperCase() + stored.plan_type.slice(1)}`
            : "Plano Trial",
        });
      } catch {
        setUser({ name: "", email: "", plan: "" });
      }
    }

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? "bg-[#0b0c0e]/80 backdrop-blur-md border-zinc-800/80 shadow-xl" : "bg-transparent border-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">

          <a href="/" className="flex items-center space-x-2 cursor-pointer">
            <img src="/logo1.png" className="w-10 h-10 object-contain" alt="Zelt.ai Logo" />
            <span className="text-xl font-black tracking-wider text-white">ZELT<span className="text-[#22c55e]">.AI</span></span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`transition-colors duration-200 font-medium text-sm ${isActive(link.href) ? "text-green-400" : "text-zinc-400 hover:text-white"}`}
              >
                {link.name}
              </a>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center space-x-4" ref={menuRef}>
                <a href="/dashboard" className="flex items-center gap-2 bg-green-600 border border-green-800 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all duration-200">
                  <LayoutDashboard className="w-4 h-4 text-white" />Painel
                </a>
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-10 h-10 bg-[#7c3aed] text-white rounded-lg flex items-center justify-center font-bold text-sm tracking-wider shadow-md hover:scale-105 transition-all active:scale-95">
                    {userInitials}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#121418] border border-zinc-800 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-3 border-b border-zinc-800">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-zinc-400 truncate mb-2">{user.email}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-100 px-2 py-0.5 rounded-full font-medium border border-yellow-600/20">
                          <ShieldCheck className="w-3 h-3" />{user.plan}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <a href="/dashboard" className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                          <User className="w-4 h-4 text-zinc-400" />Minha Conta
                        </a>
                        <button onClick={() => setLogoutModal(true)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left">
                          <LogOut className="w-4 h-4" />Sair da conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <a href="/register" className="inline-block bg-[#22c55e] hover:bg-[#16a34a] text-black px-5 py-2 rounded-lg font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm">
                Começar Grátis
              </a>
            )}
          </div>

          <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0b0c0e] border-t border-zinc-800 animate-in slide-in-from-top duration-200">
          <div className="px-6 py-6 space-y-5">
            {NAV_LINKS.map((link) => (
              <a key={link.name} href={link.href} className="block text-zinc-400 hover:text-white transition-colors font-medium text-base" onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <div className="pt-2 border-t border-zinc-900">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-1 py-2">
                    <div className="w-10 h-10 bg-[#7c3aed] text-white rounded-lg flex items-center justify-center font-bold text-sm">{userInitials}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <a href="/dashboard" className="flex items-center justify-center gap-2 w-full bg-zinc-900 border border-zinc-800 text-white py-2.5 rounded-lg font-medium text-sm">
                    <LayoutDashboard className="w-4 h-4 text-[#22c55e]" />Ir para o Painel
                  </a>
                </div>
              ) : (
                <a href="/register" className="block w-full bg-[#22c55e] text-black py-2.5 rounded-lg font-semibold text-sm text-center">
                  Começar Grátis
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {logoutModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-4 animate-in fade-in duration-200">
          <div className="bg-[#121418] border border-zinc-800 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white tracking-wide">Tem certeza?</h3>
              <button onClick={() => setLogoutModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"><XIcon size={18} /></button>
            </div>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente para acessar a ZeltAI.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setLogoutModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">Cancelar</button>
              <button
                onClick={() => {
                  localStorage.removeItem("zelt_token");
                  localStorage.removeItem("zelt_user");
                  setLogoutModal(false);
                  setIsLoggedIn(false);
                  setUser({ name: "", email: "", plan: "" });
                  window.location.href = "/";
                }}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
