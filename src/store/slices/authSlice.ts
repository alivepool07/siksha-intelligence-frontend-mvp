import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'
import { clearStoredRefreshToken, setStoredRefreshToken } from '@/lib/refreshToken'

export interface User {
  /** Backend user identifier (from `userDetailsDto.userId`). */
  userId: string
  username: string
  email: string
  roles: string[]
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  /** Backend may force the user to change password after login. */
  requiresPasswordChange: boolean
  loading: boolean
  error: string | null
}

export interface LoginRequest {
  username: string
  password: string
  /**
   * When true, backend returns a refresh token and the frontend persists it.
   * When false, backend returns refreshToken = null and frontend clears any stored refresh token.
   */
  rememberMe: boolean
}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken?: string
  requiresPasswordChange?: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  requiresPasswordChange: false,
  loading: false,
  error: null,
}

const extractMessage = (error: unknown): string => {
  // Keep error handling resilient to different Axios/backends error shapes.
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message
  }
  return 'Something went wrong'
}

const normalizeLoginResponse = (data: any): LoginResponse => {
  // Swagger shape: { accessToken, refreshToken, userDetailsDto, roles, requiresPasswordChange }
  const token =
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    data?.data?.accessToken ??
    data?.data?.access_token ??
    data?.data?.token

  const refreshToken =
    data?.refreshToken ??
    data?.refresh_token ??
    data?.data?.refreshToken ??
    data?.data?.refresh_token

  const userDetails =
    data?.userDetailsDto ??
    data?.data?.userDetailsDto ??
    data?.userDetails ??
    data?.data?.userDetails

  const requiresPasswordChange =
    data?.requiresPasswordChange ??
    data?.data?.requiresPasswordChange

  if (!token || typeof token !== 'string') {
    throw new Error('Login failed: missing access token')
  }

  if (!userDetails || typeof userDetails !== 'object') {
    throw new Error('Login failed: missing user data')
  }

  return {
    accessToken: token,
    refreshToken: typeof refreshToken === 'string' && refreshToken.length > 0 ? refreshToken : undefined,
    requiresPasswordChange: typeof requiresPasswordChange === 'boolean' ? requiresPasswordChange : undefined,
    user: {
      userId: String(userDetails.userId ?? userDetails.user_id ?? userDetails.id ?? ''),
      username: String(userDetails.username ?? ''),
      email: String(userDetails.email ?? ''),
      roles: Array.isArray(userDetails.roles)
        ? userDetails.roles.map(String)
        : (Array.isArray(data?.roles) ? data.roles.map(String) : []),
    },
  }
}

export const login = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, thunkApi) => {
    try {
      // Always send rememberMe so backend can decide whether to return a refresh token.
      const payload: Record<string, unknown> = {
        username: credentials.username,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      }

      const res = await api.post('/auth/login', payload, { withCredentials: true })
      return normalizeLoginResponse(res.data)
    } catch (err) {
      return thunkApi.rejectWithValue(extractMessage(err))
    }
  },
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User | null; accessToken: string | null }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = Boolean(action.payload.accessToken)
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null

      clearStoredRefreshToken()
      // Clear persisted auth state
      try {
        localStorage.removeItem('si_auth_state')
      } catch {
        // ignore
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        // Persist refresh token only if the user chose "Remember me".
        const rememberMe = Boolean(action.meta.arg.rememberMe)
        state.refreshToken = rememberMe ? (action.payload.refreshToken ?? null) : null
        state.isAuthenticated = true
        state.requiresPasswordChange = Boolean(action.payload.requiresPasswordChange)
        state.error = null

        if (rememberMe && action.payload.refreshToken) {
          setStoredRefreshToken(action.payload.refreshToken)
        } else {
          clearStoredRefreshToken()
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Login failed'
      })
  },
})

export const { setCredentials, logout } = authSlice.actions
export const authReducer = authSlice.reducer
