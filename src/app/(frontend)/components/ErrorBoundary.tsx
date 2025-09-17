'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { clientLogger } from '../../api/lib/logger/clientLogger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    clientLogger.error('React Error Boundary caught an error', {
      error,
      component: 'ErrorBoundary',
      context: {
        componentStack: errorInfo.componentStack,
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  public render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}