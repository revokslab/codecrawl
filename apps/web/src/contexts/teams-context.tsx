'use client'

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { defaultQueryFn } from '~/lib/default-query-fn'

export interface Team {
  id: string
  name: string
  apiKeys: ApiKey[]
}

export interface ApiKey {
  id: string
  name: string
  key: string
}

interface TeamsContextType {
  teams: Team[]
  activeTeam: Team | null
  activeTeamId: string | null
  isLoading: boolean
  error: Error | null
  handleSetActiveTeam: (teamId: string) => void
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

interface TeamsProviderProps {
  children: ReactNode
}

const LOCAL_STORAGE_ACTIVE_TEAM_ID = 'activeTeamId'

export const TeamsProvider: React.FC<TeamsProviderProps> = ({ children }) => {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)

  const {
    data: teams = [],
    isLoading,
    error,
  } = useQuery<Team[], Error>({
    queryKey: ['teams'],
    queryFn: defaultQueryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!isLoading) {
      const storedTeamId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_TEAM_ID)

      if (storedTeamId && teams.some((team) => team.id === storedTeamId)) {
        if (storedTeamId !== activeTeamId) {
          setActiveTeamId(storedTeamId)
        }
      } else if (teams.length > 0) {
        const firstTeamId = teams[0].id
        if (firstTeamId !== activeTeamId) {
          setActiveTeamId(firstTeamId)
          localStorage.setItem(LOCAL_STORAGE_ACTIVE_TEAM_ID, firstTeamId)
        }
      } else {
        if (activeTeamId !== null) {
          setActiveTeamId(null)
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_TEAM_ID)
        }
      }
    }
  }, [teams, isLoading, activeTeamId])

  const activeTeam = useMemo(() => {
    if (!activeTeamId || teams.length === 0) {
      return null
    }
    return teams.find((team) => team.id === activeTeamId) ?? null
  }, [activeTeamId, teams])

  const handleSetActiveTeam = useCallback(
    (teamId: string) => {
      if (teams.some((team) => team.id === teamId)) {
        setActiveTeamId(teamId)
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_TEAM_ID, teamId)
      } else {
        console.warn(`Attempted to set active team to non-existent ID: ${teamId}`)
      }
    },
    [teams]
  )

  const contextValue = useMemo(
    () => ({
      teams,
      activeTeam,
      activeTeamId,
      isLoading,
      error,
      handleSetActiveTeam,
    }),
    [teams, activeTeam, activeTeamId, isLoading, error, handleSetActiveTeam]
  )

  return <TeamsContext.Provider value={contextValue}>{children}</TeamsContext.Provider>
}

export const useTeams = (): TeamsContextType => {
  const context = useContext(TeamsContext)
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider')
  }
  return context
}
