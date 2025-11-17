// Storage utilities for managing user accounts and data
export interface UserAccount {
  username: string
  createdAt: string
  avatar?: string
  password?: string
  hasPassword?: boolean
  notes: Array<{ id: string; title: string; content: string }>
  settings: {
    notifications: boolean
    sound: boolean
    wifi: boolean
    bluetooth: boolean
  }
  savedHtmlApps: Array<{ id: string; name: string; html: string }>
  drxApps?: Array<{ id: string; name: string; html: string; installedAt: string }>
  fileSystem?: any
}

const STORAGE_KEY = "dotlyos_accounts"
const CURRENT_USER_KEY = "dotlyos_current_user"
const SELECTED_ACCOUNT_KEY = "dotlyos_selected_account"

export function getAllAccounts(): UserAccount[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveAccount(account: UserAccount) {
  const accounts = getAllAccounts()
  const existingIndex = accounts.findIndex((a) => a.username === account.username)

  if (existingIndex >= 0) {
    accounts[existingIndex] = account
  } else {
    accounts.push(account)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function getAccount(username: string): UserAccount | null {
  const accounts = getAllAccounts()
  return accounts.find((a) => a.username === username) || null
}

export function deleteAccount(username: string) {
  const accounts = getAllAccounts().filter((a) => a.username !== username)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function clearAccountData(username: string) {
  const account = getAccount(username)
  if (!account) return

  // Reset account data to defaults
  account.notes = []
  account.savedHtmlApps = []
  account.settings = {
    notifications: true,
    sound: true,
    wifi: true,
    bluetooth: false,
  }
  account.drxApps = []
  account.hasPassword = false

  saveAccount(account)
}

export function setCurrentUser(username: string) {
  localStorage.setItem(CURRENT_USER_KEY, username)
}

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function setSelectedAccount(username: string) {
  localStorage.setItem(SELECTED_ACCOUNT_KEY, username)
}

export function getSelectedAccount(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(SELECTED_ACCOUNT_KEY)
}

export function clearSelectedAccount() {
  localStorage.removeItem(SELECTED_ACCOUNT_KEY)
}

export function createDefaultAccount(username: string): UserAccount {
  return {
    username,
    createdAt: new Date().toISOString(),
    hasPassword: false,
    notes: [],
    settings: {
      notifications: true,
      sound: true,
      wifi: true,
      bluetooth: false,
    },
    savedHtmlApps: [],
    drxApps: [],
  }
}
