import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { LiaRobotSolid } from "react-icons/lia";

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function ZeltRegister() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!companyName) e.companyName = "Nome da empresa obrigatório";
    if (!email) e.email = "E-mail obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail inválido";
    if (!password) e.password = "Senha obrigatória";
    return e;
  };

  async function handleGoogleLogin(response) {

    try {
      setLoading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          token: response.credential
        }
      )

      localStorage.setItem(
        "zelt_token",
        res.data.access
      )

      localStorage.setItem(
        "zelt_user",
        JSON.stringify(res.data.user)
      )

      console.log(res.data)
      window.location.href = "/dashboard"
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (ev) => {
    ev.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // abre modal do captcha
    setShowCaptcha(true);
  };

  async function handleRegister(ev) {
    ev.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: companyName,
          email,
          password,
          captcha: captchaToken
        }
      );

      // depois do register já loga automaticamente
      const login = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
          captcha: captchaToken
        }
      );

      localStorage.setItem("zelt_token", login.data.access);
      localStorage.setItem("zelt_user", JSON.stringify(login.data.user));

      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);

      setErrors({
        auth: err.response?.data?.detail || "Erro ao criar conta"
      });

    } finally {
      setLoading(false);
    }
  }

  const clearError = (field) => (ev) => {
    const value = ev.target.value;

    if (field === "companyName") setCompanyName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 px-12 py-12 relative overflow-hidden">

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative">
          <img src="/logo1.png" alt="Zelt.AI" className="w-8 h-8 object-contain" />
          <span className="text-white font-semibold tracking-tight">Zelt<span className="text-green-400">.AI</span></span>
        </div>

        {/* Middle content */}
        <div className="relative space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-white leading-snug mb-3">
              Seu negócio trabalhando<br />enquanto você descansa.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              O Zelt.AI atende, qualifica e converte clientes pelo WhatsApp — 24h por dia, sem intervenção humana.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                text: "Setup em menos de 2 horas",
                icon: (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
              },
              {
                text: "IA treinada com seu catálogo e regras",
                icon: (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              {
                text: "Até 3x mais conversões nas primeiras 48h",
                icon: (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.10] backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <p className="text-sm text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="bg-white/[0.07] backdrop-blur-md border border-white/[0.10] rounded-2xl p-5">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              "Implantei em dois dias. Agora meu WhatsApp vende enquanto eu durmo."
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">C</div>
              <div>
                <p className="text-xs font-medium text-white">Carla Mendes</p>
                <p className="text-xs text-zinc-400">Boutique Carla M.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-500 relative">© 2025 Zelt.AI · Ecossistema UrbanSoft</p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-black">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <img src="/assets/logo1.png" alt="Zelt.AI" className="w-8 h-8 object-contain" />
            <span className="text-white font-semibold tracking-tight">Zelt<span className="text-green-400">.AI</span></span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo ao Zelt.AI!</h1>
          <p className="text-sm text-zinc-500 mb-8">
            Já tem uma conta?{" "}
            <a href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Entre na sua conta
            </a>
          </p>

          <div className="w-full flex justify-center">

          <div className="scale-[1.02]">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.log("Erro Google")}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signup_with"
              width="370"
            />
          </div>

        </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-zinc-600">ou continue com e-mail</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Nome da sua empresa</label>
              <input
                type="text"
                className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-all
                  ${errors.password
                    ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                    : "border-white/[0.08] focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10"
                  }`}
                placeholder="Minha Empresa"
                value={companyName}
                onChange={clearError("companyName")}
              />

              {errors.companyName && (
                <p className="text-xs text-red-400">{errors.companyName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">E-mail</label>
              <input
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={clearError("email")}
                className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all
                  ${errors.email
                    ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                    : "border-white/[0.08] focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10"
                  }`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">Senha</label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={clearError("password")}
                  className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-all
                    ${errors.password
                      ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                      : "border-white/[0.08] focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              onClick={handleSubmit}
              type="button"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-b from-green-400 to-green-500 hover:from-green-300 hover:to-green-400 disabled:opacity-50 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] active:scale-[0.985]"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-700 mt-8">
            Ao entrar, você concorda com os{" "}
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">Termos de Uso</a>
            {" "}e{" "}
            <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">Privacidade</a>.
          </p>
        </div>
      </div>

      {showCaptcha && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="relative w-[380px] bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl">

            {/* botão fechar */}
            <button
              onClick={() => {
                setShowCaptcha(false);
                setCaptchaToken("");
              }}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition"
            >
              ✕
            </button>

            {/* header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <LiaRobotSolid className="text-green-400 text-xl" />
              </div>

              <div>
                <h2 className="text-white font-semibold text-sm">
                  Verificação de segurança
                </h2>
                <p className="text-xs text-zinc-500">
                  Confirme que você não é um bot
                </p>
              </div>
            </div>

            {/* captcha */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={async (token) => {
                  try {
                    setLoading(true);
                    setCaptchaToken(token);

                    await axios.post(
                      `${import.meta.env.VITE_API_URL}/auth/register`,
                      {
                        name: companyName,
                        email,
                        password,
                        captcha: token
                      }
                    );

                    // sucesso → fecha modal e vai direto
                    setShowCaptcha(false);

                    window.location.href = "/dashboard";

                  } catch (err) {
                    console.error(err);
                    setCaptchaToken("");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </div>

            <p className="text-[11px] text-zinc-600 mt-4 text-center">
              Isso ajuda a proteger o sistema contra bots e spam.
            </p>

          </div>
        </div>
      )}
    </div>
  );
}
