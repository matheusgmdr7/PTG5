"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Globe } from "lucide-react"

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Definir português como idioma padrão se não houver idioma selecionado
  useEffect(() => {
    if (!localStorage.getItem("i18nextLng")) {
      i18n.changeLanguage("pt")
    }
  }, [i18n])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
    localStorage.setItem("i18nextLng", language)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-violet-700/30 px-4 py-2 bg-black/40 backdrop-blur-sm text-sm font-medium text-gray-300 hover:text-white hover:border-violet-600/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="mr-2 h-4 w-4 text-violet-400" />
        <span className="truncate max-w-[100px]">
          {currentLanguage === "pt" ? t("common.portuguese") : t("common.english")}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-black/80 backdrop-blur-sm border border-violet-700/30 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu">
            <button
              onClick={() => changeLanguage("en")}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                currentLanguage === "en" ? "bg-violet-900/30 text-violet-400" : "text-gray-300 hover:bg-violet-900/20"
              }`}
              role="menuitem"
            >
              {t("common.english")}
            </button>
            <button
              onClick={() => changeLanguage("pt")}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                currentLanguage === "pt" ? "bg-violet-900/30 text-violet-400" : "text-gray-300 hover:bg-violet-900/20"
              }`}
              role="menuitem"
            >
              {t("common.portuguese")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
