// src/lib/utils.ts - VERSIONE COMPLETA

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatta data in italiano
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/D'
  
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return 'Data non valida'
  }
}

/**
 * Formatta data e ora in italiano
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/D'
  
  try {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Data non valida'
  }
}

/**
 * Formatta valuta in euro
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/D'
  
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/**
 * Formatta numero
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/D'
  
  return new Intl.NumberFormat('it-IT').format(value)
}

/**
 * Trunca testo lungo
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return 'N/D'
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

/**
 * Capitalizza prima lettera
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}