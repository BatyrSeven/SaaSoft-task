import { defineStore } from 'pinia'

const STORAGE_KEY = 'account-store'

export interface Account {
  labelsRaw: string
  labels: { text: string }[]
  type: 'Local' | 'LDAP'
  login: string
  password: string
  showPassword: boolean
  errors: {
    labelsRaw: string
    login: string
    password: string
  }
}

function createEmptyAccount(): Account {
  return {
    labelsRaw: '',
    labels: [],
    type: 'Local',
    login: '',
    password: '',
    showPassword: false,
    errors: {
      labelsRaw: '',
      login: '',
      password: ''
    }
  }
}

function parseLabels(raw: string): { text: string }[] {
  return raw
    .split(';')
    .map(label => label.trim())
    .filter(Boolean)
    .map(text => ({ text }))
}

function stripErrors(account: Account): Account {
  return {
    ...account,
    errors: {
      labelsRaw: '',
      login: '',
      password: ''
    },
    showPassword: false
  }
}

export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    accounts: [] as Account[]
  }),

  actions: {
    loadFromStorage() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed: Account[] = JSON.parse(raw)
          this.accounts = parsed.map(acc => ({
            ...acc,
            labelsRaw: acc.labels.map(l => l.text).join('; '),
            errors: { labelsRaw: '', login: '', password: '' },
            showPassword: false
          }))
        } catch {
          this.accounts = [createEmptyAccount()]
        }
      } else {
        this.accounts = [createEmptyAccount()]
      }
    },

    saveToStorage() {
      const toSave = this.accounts.map(acc => stripErrors({
        ...acc,
        labels: parseLabels(acc.labelsRaw)
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    },

    addAccount() {
      this.accounts.push(createEmptyAccount())
      this.saveToStorage()
    },

    removeAccount(index: number) {
      this.accounts.splice(index, 1)
      this.saveToStorage()
    },

    togglePassword(index: number) {
      this.accounts[index].showPassword = !this.accounts[index].showPassword
    },

    validateAndSave(index: number) {
      const acc = this.accounts[index]
      let isValid = true

      acc.labels = parseLabels(acc.labelsRaw)
      acc.errors.labelsRaw = acc.labels.length === 0 ? 'Укажите хотя бы одну метку' : ''
      isValid &&= acc.errors.labelsRaw === ''

      acc.errors.login = acc.login.trim() ? '' : 'Укажите логин'
      isValid &&= acc.errors.login === ''

      if (acc.type === 'Local') {
        acc.errors.password = acc.password.trim() ? '' : 'Укажите пароль'
        isValid &&= acc.errors.password === ''
      } else {
        acc.errors.password = ''
      }

      if (isValid) {
        this.accounts[index] = {
          ...acc,
          labels: parseLabels(acc.labelsRaw)
        }
        this.saveToStorage()
      }
    }
  }
})
