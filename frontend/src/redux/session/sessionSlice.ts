// frontend/src/redux/session/sessionSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SessionState {
  role: 'student' | 'teacher' | null
  displayName: string | null
  clientId: string | null
  pollId: string | null
  isConnected: boolean
  socketId: string | null
}

const initialState: SessionState = {
  role: localStorage.getItem('role') as 'student' | 'teacher' | null,
  displayName: localStorage.getItem('displayName'),
  clientId: localStorage.getItem('clientId'),
  pollId: localStorage.getItem('pollId'),
  isConnected: false,
  socketId: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<'student' | 'teacher'>) => {
      state.role = action.payload
      localStorage.setItem('role', action.payload)
    },
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload
      localStorage.setItem('displayName', action.payload)
    },
    setClientId: (state, action: PayloadAction<string>) => {
      state.clientId = action.payload
      localStorage.setItem('clientId', action.payload)
    },
    setPollId: (state, action: PayloadAction<string>) => {
      state.pollId = action.payload
      localStorage.setItem('pollId', action.payload)
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setSocketId: (state, action: PayloadAction<string>) => {
      state.socketId = action.payload
    },
    clearSession: (state) => {
      state.role = null
      state.displayName = null
      state.clientId = null
      state.pollId = null
      state.isConnected = false
      state.socketId = null
      localStorage.removeItem('role')
      localStorage.removeItem('displayName')
      localStorage.removeItem('clientId')
      localStorage.removeItem('pollId')
    }
  },
})

export const { setRole, setDisplayName, setClientId, setPollId, setConnected, setSocketId, clearSession } = sessionSlice.actions
export default sessionSlice.reducer