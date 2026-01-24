import redaxios from 'redaxios'
import { useTokenStore } from '~/store/use-token-store'
import { API_BASE_URL } from './constants'

/**
 * Interface for the arguments passed to the generic mutation function.
 */
interface MutationFnArgs {
  /** The URL endpoint for the mutation. */
  endpoint: string
  /** The data payload to send with the request (optional). */
  data?: any
  /** The HTTP method to use (defaults to 'POST'). */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

/**
 * A generic mutation function for use with React Query, utilizing redaxios.
 * It sends a request (defaulting to POST) to the specified URL with optional data.
 *
 * @param {MutationFnArgs} args - An object containing the URL, optional data, and optional method.
 * @returns {Promise<TResponse>} A promise that resolves with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const mutationFnHelper = async ({
  endpoint,
  data,
  method = 'POST',
}: MutationFnArgs): Promise<any> => {
  const { accessToken, refreshToken } = useTokenStore.getState()
  try {
    const response = await redaxios({
      url: `${API_BASE_URL}/${endpoint}`,
      method,
      data: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': accessToken,
        'X-Refresh-Token': refreshToken,
      },
    })

    const _accessToken = response.headers.get('access-token')
    const _refreshToken = response.headers.get('refresh-token')

    if (_accessToken && _refreshToken) {
      useTokenStore.getState().setTokens({
        accessToken: _accessToken,
        refreshToken: _refreshToken,
      })
    }

    return response.data
  } catch (error) {
    console.error(`Mutation failed: ${method} ${endpoint}`, error)
    throw error
  }
}
