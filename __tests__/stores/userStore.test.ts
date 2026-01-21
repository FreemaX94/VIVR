import { act } from '@testing-library/react'
import { useUserStore } from '@/stores/userStore'
import { User, Address } from '@/types'

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'John Doe',
  image: 'avatar.jpg',
  addresses: [],
}

const mockUserWithAddresses: User = {
  id: 'user-2',
  email: 'test2@example.com',
  name: 'Jane Doe',
  addresses: [
    {
      id: 'addr-1',
      userId: 'user-2',
      name: 'Domicile',
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      isDefault: true,
    },
  ],
}

const mockAddress: Address = {
  id: 'addr-new',
  userId: 'user-1',
  name: 'Bureau',
  street: '456 Avenue des Champs',
  city: 'Lyon',
  postalCode: '69001',
  country: 'France',
  phone: '+33 1 23 45 67 89',
  isDefault: false,
}

const mockAddress2: Address = {
  id: 'addr-2',
  userId: 'user-1',
  name: 'Parents',
  street: '789 Boulevard Saint-Michel',
  city: 'Marseille',
  postalCode: '13001',
  country: 'France',
  isDefault: false,
}

describe('userStore', () => {
  beforeEach(() => {
    act(() => {
      useUserStore.getState().logout()
    })
  })

  describe('initial state', () => {
    it('should have no user initially', () => {
      const state = useUserStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.addresses).toEqual([])
    })
  })

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser)
      })

      const state = useUserStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should set addresses from user object', () => {
      act(() => {
        useUserStore.getState().setUser(mockUserWithAddresses)
      })

      const state = useUserStore.getState()
      expect(state.addresses).toHaveLength(1)
      expect(state.addresses[0].name).toBe('Domicile')
    })

    it('should handle user without addresses', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser)
      })

      expect(useUserStore.getState().addresses).toEqual([])
    })

    it('should handle setting null user', () => {
      act(() => {
        useUserStore.getState().setUser(mockUser)
        useUserStore.getState().setUser(null)
      })

      const state = useUserStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and addresses', () => {
      act(() => {
        useUserStore.getState().setUser(mockUserWithAddresses)
        useUserStore.getState().logout()
      })

      const state = useUserStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.addresses).toEqual([])
    })

    it('should work when already logged out', () => {
      act(() => {
        useUserStore.getState().logout()
      })

      const state = useUserStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('addAddress', () => {
    it('should add address to list', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
      })

      const state = useUserStore.getState()
      expect(state.addresses).toHaveLength(1)
      expect(state.addresses[0]).toEqual(mockAddress)
    })

    it('should add multiple addresses', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().addAddress(mockAddress2)
      })

      expect(useUserStore.getState().addresses).toHaveLength(2)
    })

    it('should unset other defaults when adding default address', () => {
      const defaultAddress: Address = { ...mockAddress, isDefault: true }
      const newDefaultAddress: Address = { ...mockAddress2, isDefault: true }

      act(() => {
        useUserStore.getState().addAddress(defaultAddress)
        useUserStore.getState().addAddress(newDefaultAddress)
      })

      const state = useUserStore.getState()
      const previousDefault = state.addresses.find(a => a.id === 'addr-new')
      const newDefault = state.addresses.find(a => a.id === 'addr-2')

      expect(previousDefault?.isDefault).toBe(false)
      expect(newDefault?.isDefault).toBe(true)
    })
  })

  describe('updateAddress', () => {
    it('should update existing address', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().updateAddress({
          ...mockAddress,
          street: 'Updated Street',
        })
      })

      const updated = useUserStore.getState().addresses[0]
      expect(updated.street).toBe('Updated Street')
    })

    it('should not affect other addresses', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().addAddress(mockAddress2)
        useUserStore.getState().updateAddress({
          ...mockAddress,
          street: 'Updated Street',
        })
      })

      const state = useUserStore.getState()
      const other = state.addresses.find(a => a.id === 'addr-2')
      expect(other?.street).toBe('789 Boulevard Saint-Michel')
    })

    it('should handle updating non-existent address', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().updateAddress({
          id: 'non-existent',
          userId: 'user-1',
          name: 'Test',
          street: 'Test',
          city: 'Test',
          postalCode: '00000',
          country: 'France',
          isDefault: false,
        })
      })

      expect(useUserStore.getState().addresses).toHaveLength(1)
    })
  })

  describe('removeAddress', () => {
    it('should remove address by id', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().addAddress(mockAddress2)
        useUserStore.getState().removeAddress('addr-new')
      })

      const state = useUserStore.getState()
      expect(state.addresses).toHaveLength(1)
      expect(state.addresses[0].id).toBe('addr-2')
    })

    it('should handle removing non-existent address', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().removeAddress('non-existent')
      })

      expect(useUserStore.getState().addresses).toHaveLength(1)
    })

    it('should handle removing from empty list', () => {
      act(() => {
        useUserStore.getState().removeAddress('addr-new')
      })

      expect(useUserStore.getState().addresses).toEqual([])
    })
  })

  describe('setDefaultAddress', () => {
    it('should set address as default', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().addAddress(mockAddress2)
        useUserStore.getState().setDefaultAddress('addr-2')
      })

      const state = useUserStore.getState()
      const addr2 = state.addresses.find(a => a.id === 'addr-2')
      expect(addr2?.isDefault).toBe(true)
    })

    it('should unset other addresses as default', () => {
      const defaultAddr: Address = { ...mockAddress, isDefault: true }

      act(() => {
        useUserStore.getState().addAddress(defaultAddr)
        useUserStore.getState().addAddress(mockAddress2)
        useUserStore.getState().setDefaultAddress('addr-2')
      })

      const state = useUserStore.getState()
      const addr1 = state.addresses.find(a => a.id === 'addr-new')
      const addr2 = state.addresses.find(a => a.id === 'addr-2')

      expect(addr1?.isDefault).toBe(false)
      expect(addr2?.isDefault).toBe(true)
    })

    it('should handle setting non-existent address as default', () => {
      act(() => {
        useUserStore.getState().addAddress(mockAddress)
        useUserStore.getState().setDefaultAddress('non-existent')
      })

      // Should not change anything
      expect(useUserStore.getState().addresses[0].isDefault).toBe(false)
    })
  })
})
