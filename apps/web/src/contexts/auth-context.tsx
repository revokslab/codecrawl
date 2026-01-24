'use client'

import React, { createContext, useContext } from 'react'
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'

export interface User {
  id: string
  email: string
  name: string
  avatar: string
}

export type AuthContextType = {
  user: User | null | undefined
  updateUser: (u: User) => void
}

export type AuthContextProviderProps = {
  children?: React.ReactNode
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  updateUser() {},
})

export const useAuthContext = () => useContext(AuthContext)
export default AuthContext

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  // const queryClient = useQueryClient();
  // const { data } = useQuery<{ user: User | null }>({
  //   queryKey: ['users/me'],
  //   retry: false,
  //   refetchOnWindowFocus: false,
  //   staleTime: 5 * 60 * 1000, // Keep prefetched data fresh for 5 mins
  // });

  // const updateUser = () => {
  //   queryClient.invalidateQueries({ queryKey: ['users/me'] });
  // };

  return (
    <AuthContext.Provider value={{ user: null, updateUser: () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}

// export const prefetchUserMe = async (queryClient: QueryClient) => {
//   await queryClient.prefetchQuery({
//     queryKey: ['users/me'],
//   });
// };
