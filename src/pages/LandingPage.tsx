"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Shield,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Star,
  Users,
  Mail,
  Zap,
} from "lucide-react"

const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-gray-200 overflow-hidden">
      {/* Animated Background - Radial mais visível */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/30 via-black to-black"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-violet-600/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBzdHJva2U9IiM1QjIxQjYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3Ryb2tlLXdpZHRoPSIuNSI+PHJlY3QgeD0iLjI1IiB5PSIuMjUiIHdpZHRoPSIxNy41IiBoZWlnaHQ9IjE3LjUiIHJ4PSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Header/Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-black/80 backdrop-blur-md border-b border-violet-900/20" : "bg-transparent"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center shadow-lg shadow-violet-600/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                <Shield className="text-white z-10" size={22} />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white tracking-wider">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    PTG
                  </span>{" "}
                  ProTraderGain
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-8">
                <li>
                  <a href="#features" className="text-gray-300 hover:text-violet-400 transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-300 hover:text-violet-400 transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-300 hover:text-violet-400 transition-colors">
                    Planos
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-300 hover:text-violet-400 transition-colors">
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-300 hover:text-violet-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-violet-500 after:to-fuchsia-500 hover:after:w-full after:transition-all after:duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl transition-all duration-300 font-medium relative overflow-hidden group shadow-md hover:shadow-lg hover:shadow-violet-600/20"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center justify-center">Começar Grátis</span>
                <span className="absolute right-0 w-0 h-full bg-white/10 group-hover:w-full transition-all duration-300 -z-10"></span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-violet-900/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-violet-900/20 animate-fade-in-up">
            <div className="px-4 py-3 space-y-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-violet-400 hover:bg-violet-900/10 rounded-lg transition-colors"
              >
                Recursos
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-violet-400 hover:bg-violet-900/10 rounded-lg transition-colors"
              >
                Como Funciona
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-violet-400 hover:bg-violet-900/10 rounded-lg transition-colors"
              >
                Planos
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-violet-400 hover:bg-violet-900/10 rounded-lg transition-colors"
              >
                Depoimentos
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-violet-400 hover:bg-violet-900/10 rounded-lg transition-colors"
              >
                FAQ
              </a>
              <div className="pt-2 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center text-gray-300 hover:text-white border border-violet-700/30 hover:border-violet-600 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-colors"
                >
                  Começar Grátis
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-violet-600/30 rounded-full filter blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/20 rounded-full filter blur-[120px] -z-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl pointer-events-none">
          <div className="absolute top-[10%] right-[15%] w-32 h-32 bg-gradient-to-br from-violet-700/10 to-fuchsia-700/10 rounded-full blur-md animate-float-random"></div>
          <div className="absolute bottom-[20%] left-[10%] w-40 h-40 bg-gradient-to-br from-fuchsia-700/10 to-violet-700/10 rounded-full blur-md animate-float-delay"></div>
          <div className="absolute top-[40%] left-[25%] w-24 h-24 bg-gradient-to-br from-violet-700/10 to-transparent rounded-full blur-md animate-float"></div>
          <div className="absolute top-[60%] right-[20%] w-36 h-36 bg-gradient-to-br from-fuchsia-700/10 to-transparent rounded-full blur-md animate-float-random"></div>
          <div className="absolute top-0 left-0 w-full h-full border border-violet-700/15 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute top-10 left-10 right-10 bottom-10 border border-fuchsia-700/15 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <div className="inline-block px-3 py-1 mb-6 rounded-full bg-violet-900/20 border border-violet-700/30 text-violet-400 text-sm font-medium">
                Trading do Futuro • Inteligência Artificial • Proteção Avançada
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Trading{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Potencializado
                </span>{" "}
                por IA
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Maximize seus lucros e minimize perdas com nosso sistema inteligente de gerenciamento de risco para traders.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl transition-all duration-300 font-medium text-center flex items-center justify-center group relative overflow-hidden shadow-md hover:shadow-lg hover:shadow-violet-600/20 transform hover:-translate-y-1"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></span>
                  <span className="relative z-10 flex items-center">
                    Começar Agora
                    <ArrowRight
                      className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      size={18}
                    />
                  </span>
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border border-violet-700/50 hover:border-violet-600 rounded-xl transition-all duration-300 font-medium text-center bg-black/40 backdrop-blur-sm hover:bg-black/60 group relative overflow-hidden hover:shadow-lg hover:shadow-violet-900/10 transform hover:-translate-y-1"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10">Como Funciona</span>
                </a>
              </div>
              <div className="mt-8 flex items-center text-gray-400">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2">
                  <CheckCircle className="text-white" size={12} />
                </div>
                <span className="text-sm">Teste grátis por 07 dias.</span>
              </div>
            </div>
            <div className="lg:w-1/2 mt-16 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-800 to-fuchsia-800 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-black/60 backdrop-blur-sm border border-violet-900/50 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-800 to-fuchsia-800"></div>
                  {/* AQUI É ONDE VOCÊ DEVE INSERIR O LINK DA IMAGEM */}
                  <img
                    src="https://i.ibb.co/vMx5mxy/Captura-de-Tela-2025-03-24-a-s-15-53-56.png"
                    alt="Dashboard PTG ProTraderGain"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                {/* Floating Elements - Restaurados */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-600/10 backdrop-blur-md rounded-xl border border-violet-500/20 flex items-center justify-center animate-float">
                  <TrendingUp className="text-violet-400" size={32} />
                </div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-fuchsia-600/10 backdrop-blur-md rounded-xl border border-fuchsia-500/20 flex items-center justify-center animate-float-delay">
                  <Shield className="text-fuchsia-400" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-violet-900/20 border border-violet-700/30 text-violet-400 text-sm font-medium">
              Recursos Avançados
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Tecnologia de Ponta para Traders</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Niveis de risco, leitura comportamental e o poder da IA para corrigir o que te impede de lucrar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg hover:shadow-violet-600/20 transition-all duration-500 hover:translate-y-[-5px] backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/10 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-violet-900/20 border border-violet-700/30 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-violet-600/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Shield className="text-violet-400 relative z-10" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Gerenciamento de Risco</h3>
              <p className="text-gray-400 mb-4">
                Com níveis de risco inteligentes, nossa tecnologia te conduz à consistência e ao lucro, protegendo seu capital e evitando exposições exageradas.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-violet-400 hover:text-violet-300 group-hover:translate-x-2 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-violet-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Saiba mais <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
              </a>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg hover:shadow-violet-600/20 transition-all duration-500 hover:translate-y-[-5px] backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-fuchsia-600/10 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-fuchsia-900/20 border border-fuchsia-700/30 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-fuchsia-600/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <BrainCircuit className="text-fuchsia-400 relative z-10" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Análise Comportamental</h3>
              <p className="text-gray-400 mb-4">
                Nossa tecnologia identifica padrões invisíveis em seu comportamento de trading e prevê tendências futuras com muita
                precisão.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 group-hover:translate-x-2 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-fuchsia-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Saiba mais <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
              </a>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg hover:shadow-violet-600/20 transition-all duration-500 hover:translate-y-[-5px] backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-600/10 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-cyan-900/20 border border-cyan-700/30 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-cyan-600/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Lightbulb className="text-cyan-400 relative z-10" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Recomendações Preditivas</h3>
              <p className="text-gray-400 mb-4">
               Receba insights personalizados com base no seu comportamento e histórico de operações.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 group-hover:translate-x-2 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Saiba mais <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
              </a>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg hover:shadow-violet-600/20 transition-all duration-500 hover:translate-y-[-5px] backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-600/10 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-green-900/20 border border-green-700/30 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-green-600/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <TrendingUp className="text-green-400 relative z-10" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Análise de Performance</h3>
              <p className="text-gray-400 mb-4">
                Visualize seu desempenho em operações de forma clara, intuitiva e totalmente responsiva.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-green-400 hover:text-green-300 group-hover:translate-x-2 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-green-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Saiba mais <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
              </a>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg hover:shadow-violet-600/20 transition-all duration-500 hover:translate-y-[-5px] backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-600/10 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-amber-900/20 border border-amber-700/30 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-amber-600/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <BarChart3 className="text-amber-400 relative z-10" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Assistente de Performance</h3>
              <p className="text-gray-400 mb-4">
               Utilize a integração com um assistente de IA para avaliar sua performance em tempo real e receber recomendações personalizadas.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-amber-400 hover:text-amber-300 group-hover:translate-x-2 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-amber-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Saiba mais <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
              </a>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg hover:shadow-violet-600/20 transition-all duration-500 hover:translate-y-[-5px] backdrop-blur-sm group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="w-16 h-16 rounded-2xl bg-red-900/20 border border-red-700/30 flex items-center justify-center mb-6 relative overflow-hidden group-hover:border-red-600/50 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Zap className="text-red-400 relative z-10" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Chat de Interação</h3>
              <p className="text-gray-400 mb-4">
                Interaja com o assistente de IA pelo chat e peça dicas e sugestões sempre que precisar.
              </p>
              <a
                href="#"
                className="inline-flex items-center text-red-400 hover:text-red-300 group-hover:translate-x-2 transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-red-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Saiba mais <ChevronRight size={16} className="ml-1 group-hover:ml-2 transition-all duration-300" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Restante do código permanece o mesmo... */}
      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-violet-900/20 border border-violet-700/30 text-violet-400 text-sm font-medium">
              Processo Simplificado
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Como Funciona</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Com apenas quatro passos, você assume todo o controle e começa a ter resultados reais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm h-full group hover:border-violet-700/50 transition-all duration-300">
                <div className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-600/20 z-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="relative z-10">1</span>
                </div>
                <h3 className="text-xl font-bold mb-4 mt-4 text-white">Sincronização</h3>
                <p className="text-gray-400">
                  Conecte sua corretora via API e deixe nossa inteligência começar a ler suas operações e transformar seus resultados.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-12 h-1 bg-gradient-to-r from-violet-800 to-fuchsia-800"></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm h-full group hover:border-violet-700/50 transition-all duration-300">
                <div className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-600/20 z-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="relative z-10">2</span>
                </div>
                <h3 className="text-xl font-bold mb-4 mt-4 text-white">Leitura de Dados</h3>
                <p className="text-gray-400">
                  Nossa inteligência analisa seu perfil e ajusta automaticamente o nível de risco ideal para começar a proteger suas operações.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-12 h-1 bg-gradient-to-r from-violet-800 to-fuchsia-800"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm h-full group hover:border-violet-700/50 transition-all duration-300">
                <div className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-600/20 z-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="relative z-10">3</span>
                </div>
                <h3 className="text-xl font-bold mb-4 mt-4 text-white">Níveis de Gerenciamento</h3>
                <p className="text-gray-400">
                 Nossa plataforma oferece níveis de gerenciamento que se adaptam à sua performance e evolução como trader.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-12 h-1 bg-gradient-to-r from-violet-800 to-fuchsia-800"></div>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm h-full group hover:border-violet-700/50 transition-all duration-300">
                <div className="absolute -top-5 -left-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-600/20 z-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <span className="relative z-10">4</span>
                </div>
                <h3 className="text-xl font-bold mb-4 mt-4 text-white">Trading Protegido</h3>
                <p className="text-gray-400">
                  Opere com confiança enquanto nosso sistema de proteção avançado monitora cada movimento e protege seu
                  capital em tempo real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-violet-900/20 border border-violet-700/30 text-violet-400 text-sm font-medium">
              Experiências Reais
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">O Que Nossos Usuários Dizem</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Traders de todos os níveis estão transformando seus resultados com nossa plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300 hover:translate-y-[-5px]">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-6 italic">
                "Desde que comecei a usar o PTG ProTraderGain, reduzi minhas perdas em 40% e aumentei minha razão de
                ganho/perda. O sistema de gerenciamento de risco neural é simplesmente revolucionário."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center mr-4">
                  <Users className="text-violet-400" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-white">Carlos Silva</h4>
                  <p className="text-sm text-gray-400">Day Trader, 3 anos de experiência</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300 hover:translate-y-[-5px]">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-6 italic">
                "As análises comportamentais quânticas me ajudaram a identificar padrões negativos que eu nem sabia que
                tinha. Agora consigo manter a disciplina mesmo em dias extremamente voláteis."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center mr-4">
                  <Users className="text-violet-400" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-white">Ana Oliveira</h4>
                  <p className="text-sm text-gray-400">Swing Trader, 5 anos de experiência</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300 hover:translate-y-[-5px]">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-6 italic">
                "Como trader iniciante, eu estava perdendo dinheiro rapidamente. O PTG me ajudou a estabelecer limites
                inteligentes e a desenvolver disciplina. Agora estou consistentemente lucrativo."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center mr-4">
                  <Users className="text-violet-400" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-white">Marcos Santos</h4>
                  <p className="text-sm text-gray-400">Trader Iniciante, 1 ano de experiência</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-violet-900/20 border border-violet-700/30 text-violet-400 text-sm font-medium">
              Planos Flexíveis
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Invista no Seu Sucesso</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Escolha o plano que melhor se adapta às suas necessidades de trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Plano Essencial */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 shadow-lg backdrop-blur-sm overflow-hidden group hover:border-violet-700/50 transition-all duration-300">
              <div className="p-8 border-b border-violet-900/30">
                <h3 className="text-xl font-bold mb-2 text-white">Essencial</h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">R$99</span>
                  <span className="text-gray-400 mb-1">/mês</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Perfeito para traders iniciantes</p>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Gerenciamento de risco básico</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Análise de comportamento</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Estatísticas de trading</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Até 100 operações/mês</span>
                  </li>
                  <li className="flex items-start text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-dark-800 border border-violet-900/30 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-gray-700" size={12} />
                    </div>
                    <span>Recomendações avançadas</span>
                  </li>
                </ul>
                <div className="pt-10">
                  <Link
                    to="/signup"
                    className="w-full px-4 py-3 border border-violet-600 text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 rounded-lg transition-all duration-300 font-medium group-hover:border-violet-500 relative overflow-hidden group shadow-sm hover:shadow-md hover:shadow-violet-900/20 transform hover:-translate-y-1"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Começar Agora</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Plano Premium - Highlighted */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border-2 border-violet-600 shadow-xl backdrop-blur-sm overflow-hidden transform md:-translate-y-4 relative group hover:shadow-violet-600/20 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-800 to-fuchsia-800 text-white px-4 py-1 text-sm font-medium">
                MAIS POPULAR
              </div>
              <div className="p-8 border-b border-violet-800/30">
                <h3 className="text-xl font-bold mb-2 text-white">Premium</h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">R$149</span>
                  <span className="text-gray-400 mb-1">/mês</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Para traders sérios e dedicados</p>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Gerenciamento de risco avançado</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Análise comportamental detalhada</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Recomendações personalizadas</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Operações ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-800 to-fuchsia-800 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <span className="text-gray-300">Alertas em tempo real</span>
                  </li>
                </ul>
                <div className="pt-10">
                  <Link
                    to="/signup"
                    className="w-full px-4 py-3 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-300 font-medium relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40 transform hover:-translate-y-1"
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute -inset-1 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></span>
                    <span className="relative z-10">Começar Agora</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-violet-900/20 border border-violet-700/30 text-violet-400 text-sm font-medium">
              Dúvidas Frequentes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Respostas para as dúvidas mais comuns sobre nossa plataforma.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-3 text-white">
                Como o sistema de gerenciamento de risco funciona?
              </h3>
              <p className="text-gray-400">
                Nossa plataforma oferece níveis de gerenciamento que permitem sua evolução como trader, sem exposição desnecessária.
                Por meio da conexão com sua exchange, nossa tecnologia analisa seu comportamento em tempo real para aplicar limites 
                ou liberar aumentos de exposição quando necessário, tudo para te conduzir à consistência e ao lucro com segurança.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-3 text-white">Com quais corretoras a plataforma é compatível?</h3>
              <p className="text-gray-400">
               Nossa plataforma se conecta diretamente às principais corretoras de cripto, como Binance e Bybit, 
                através de uma API de integração segura e em tempo real. Essa conexão permite que nossa tecnologia 
                leia suas operações com precisão e aplique gestão de risco inteligente sem interferir na sua autonomia como trader.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-3 text-white">
                Quantas operações são necessárias para obter insights úteis?
              </h3>
              <p className="text-gray-400">
               Nossa IA avançada começa a gerar insights básicos com apenas 3 a 5 operações.
               Com 10 a 15 operações, ela já fornece análises comportamentais precisas com alto nível de confiança.
               A partir de 30 operações, a IA entrega análises completas e recomendações preditivas altamente confiáveis.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-3 text-white">
                Posso cancelar minha assinatura a qualquer momento?
              </h3>
              <p className="text-gray-400">
                Sim, você pode cancelar sua assinatura a qualquer momento sem taxas ou penalidades. Oferecemos um
                período de teste gratuito de 07 dias para que você possa experimentar todos os recursos avançados antes
                de decidir.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-2xl border border-violet-900/30 p-8 shadow-lg backdrop-blur-sm group hover:border-violet-700/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-3 text-white">Meus dados estão seguros?</h3>
              <p className="text-gray-400">
                Absolutamente. Utilizamos criptografia de ponta a ponta e seguimos os mais rigorosos padrões de
                segurança. Seus dados nunca são compartilhados com terceiros e você tem controle total sobre suas
                informações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-2xl border border-violet-800/40 p-6 md:p-10 lg:p-14 shadow-xl text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-800 to-fuchsia-800"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl -z-10"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Pronto para Revolucionar seu Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de traders que estão transformando seus resultados com nossa plataforma de
              gerenciamento de risco para traders que desejam ser consistentes e lucrativos.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl transition-all duration-300 font-medium text-center relative overflow-hidden group shadow-lg shadow-violet-700/20 hover:shadow-violet-600/40 transform hover:-translate-y-1"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute -inset-1 bg-gradient-to-r from-violet-800/50 to-fuchsia-800/50 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></span>
                <span className="relative z-10">Começar Teste Gratuito</span>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-black/40 hover:bg-black/60 border border-violet-700/50 hover:border-violet-600 rounded-xl transition-all duration-300 font-medium text-center group relative overflow-hidden hover:shadow-lg hover:shadow-violet-900/10 transform hover:-translate-y-1"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-800/5 to-fuchsia-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Saiba Mais</span>
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-6">Teste por 07 dias.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-violet-900/30 pt-16 pb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 to-black -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center shadow-lg shadow-violet-600/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                  <Shield className="text-white z-10" size={22} />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white tracking-wider">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                      PTG
                    </span>{" "}
                    ProTraderGain
                  </h1>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Transformando traders com gerenciamento de risco inteligente e análise comportamental avançada.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-violet-900/20 border border-violet-700/30 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:border-violet-600/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-violet-900/20 border border-violet-700/30 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:border-violet-600/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-violet-900/20 border border-violet-700/30 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:border-violet-600/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-violet-900/20 border border-violet-700/30 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:border-violet-600/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Links Rápidos</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Planos
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-violet-400 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Política de Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors">
                    Aviso Legal
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Contato</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Mail className="text-violet-400 mr-2 flex-shrink-0 mt-1" size={16} />
                  <a href="mailto:contato@ptg.com.br" className="text-gray-400 hover:text-violet-400 transition-colors">
                    contato@ptg.com.br
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="inline-block px-4 py-2 bg-violet-900/20 hover:bg-violet-900/30 rounded-lg text-gray-300 hover:text-white transition-all duration-300 mt-4 border border-violet-700/30 hover:border-violet-600/50 relative overflow-hidden group transform hover:-translate-y-1 hover:shadow-md hover:shadow-violet-900/20"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-800/5 to-fuchsia-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Fale Conosco</span>
                  </a>
                </li>
              </ul>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 text-white">Inscreva-se para novidades</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    className="px-4 py-2 bg-black border border-violet-700/30 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-gray-300 w-full"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-violet-800 to-fuchsia-800 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-r-lg transition-all duration-300 relative overflow-hidden group shadow-md hover:shadow-lg hover:shadow-violet-600/20">
                    <span className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute inset-0 w-0 bg-white/10 group-hover:w-full transition-all duration-300 -z-10"></span>
                    <span className="relative z-10">Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-violet-900/30 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2023 PTG ProTraderGain. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
