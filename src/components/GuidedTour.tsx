"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useAppStore } from "../store"

const GuidedTour: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { setTourCompleted, isTourCompleted } = useAppStore()
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    // Only start the tour if it hasn't been completed and we're on the dashboard
    if (!isTourCompleted && location.pathname === "/") {
      // Give the UI time to render before starting the tour
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isTourCompleted, location.pathname])

  useEffect(() => {
    // Define steps based on the current route
    if (location.pathname === "/") {
      setSteps([
        {
          target: ".dashboard-welcome",
          content: t("tour.welcomeMessage"),
          placement: "center",
          disableBeacon: true,
          title: t("tour.welcome"),
        },
        {
          target: ".risk-status-card",
          content: t("tour.riskStatusExplanation"),
          title: t("tour.riskStatus"),
        },
        {
          target: ".risk-level-selector",
          content: t("tour.riskLevelExplanation"),
          title: t("tour.riskLevelSelector"),
        },
        {
          target: ".positions-list",
          content: t("tour.positionsExplanation"),
          title: t("tour.positions"),
        },
        {
          target: ".sidebar-nav",
          content: t("tour.navigationExplanation"),
          title: t("tour.navigation"),
        },
        {
          target: ".exchange-connector-link",
          content: t("tour.connectExchangeExplanation"),
          title: t("tour.connectExchange"),
        },
      ])
    }
  }, [location.pathname, t])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data

    // Tour is finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      setTourCompleted(true)
    }
  }

  const joyrideStyles = {
    options: {
      primaryColor: "#22c55e",
      backgroundColor: "#1e293b",
      textColor: "#e2e8f0",
      arrowColor: "#1e293b",
      overlayColor: "rgba(0, 0, 0, 0.7)",
    },
    tooltipContainer: {
      textAlign: "left" as const,
    },
    buttonNext: {
      backgroundColor: "#22c55e",
      color: "#0f172a",
      fontSize: "14px",
    },
    buttonBack: {
      color: "#94a3b8",
      marginRight: 10,
      fontSize: "14px",
    },
    buttonSkip: {
      color: "#94a3b8",
      fontSize: "14px",
    },
    spotlight: {
      backgroundColor: "transparent",
      borderRadius: 4,
    },
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={joyrideStyles}
      disableScrolling
      locale={{
        back: t("tour.back"),
        close: t("tour.close"),
        last: t("tour.finish"),
        next: t("tour.next"),
        skip: t("tour.skip"),
      }}
    />
  )
}

export default GuidedTour
