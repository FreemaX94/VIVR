import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Address } from '@/types'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  addresses: Address[]

  // Actions
  setUser: (user: User | null) => void
  logout: () => void
  addAddress: (address: Address) => void
  updateAddress: (address: Address) => void
  removeAddress: (addressId: string) => void
  setDefaultAddress: (addressId: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      addresses: [],

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          addresses: user?.addresses || [],
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          addresses: [],
        })
      },

      addAddress: (address: Address) => {
        set((state) => {
          // If this is the first address or marked as default, update others
          const addresses = address.isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false }))
            : state.addresses

          return {
            addresses: [...addresses, address],
          }
        })
      },

      updateAddress: (address: Address) => {
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === address.id ? address : a
          ),
        }))
      },

      removeAddress: (addressId: string) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== addressId),
        }))
      },

      setDefaultAddress: (addressId: string) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === addressId,
          })),
        }))
      },
    }),
    {
      name: 'vivr-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        addresses: state.addresses,
      }),
    }
  )
)
