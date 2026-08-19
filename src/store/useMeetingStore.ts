import { create } from 'zustand'
import type { Meeting, Participant } from '@/types/meeting'
import { meetingApi } from '@/api/meeting.api'

export type MeetingView = 'grid' | 'spotlight' | 'whiteboard' | 'screen-share'

interface MeetingState {
  meeting: Meeting | null
  participants: Participant[]
  isInMeeting: boolean
  isJoining: boolean
  view: MeetingView
  micEnabled: boolean
  cameraEnabled: boolean
  screenSharing: boolean
  handRaised: boolean
  isSelfSpeaking: boolean
  audioUnavailable: boolean
  videoUnavailable: boolean
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  sidebar: 'chat' | 'participants' | null
  join: (meetingId: string) => Promise<void>
  leave: () => Promise<void>
  setMeeting: (meeting: Meeting | null) => void
  setParticipants: (participants: Participant[]) => void
  setView: (view: MeetingView) => void
  toggleMic: () => void
  toggleCamera: () => void
  toggleScreenShare: () => void
  toggleHand: () => void
  setSelfSpeaking: (speaking: boolean) => void
  setSidebar: (sidebar: 'chat' | 'participants' | null) => void
  setDeviceAvailability: (audio: boolean, video: boolean) => void
  setConnectionQuality: (quality: MeetingState['connectionQuality']) => void
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meeting: null,
  participants: [],
  isInMeeting: false,
  isJoining: false,
  view: 'grid',
  micEnabled: true,
  cameraEnabled: true,
  screenSharing: false,
  handRaised: false,
  isSelfSpeaking: false,
  audioUnavailable: false,
  videoUnavailable: false,
  connectionQuality: 'good',
  sidebar: null,

  async join(meetingId) {
    set({ isJoining: true })
    try {
      const meeting = await meetingApi.getMeeting(meetingId)
      const participants = await meetingApi.getParticipants(meetingId)
      set({
        meeting,
        participants,
        isInMeeting: true,
        isJoining: false,
        view: 'grid',
        sidebar: null,
        micEnabled: true,
        cameraEnabled: true,
        handRaised: false,
        screenSharing: false,
      })
    } catch (error) {
      set({ isJoining: false })
      throw error
    }
  },

  async leave() {
    await meetingApi.leaveRoom(get().meeting?.id ?? '')
    set({
      isInMeeting: false,
      meeting: null,
      participants: [],
      screenSharing: false,
      handRaised: false,
      sidebar: null,
      view: 'grid',
    })
  },

  setMeeting: (meeting) => set({ meeting }),
  setParticipants: (participants) => set({ participants }),
  setView: (view) => set({ view }),
  toggleMic: () => set((s) => ({ micEnabled: !s.micEnabled })),
  toggleCamera: () => set((s) => ({ cameraEnabled: !s.cameraEnabled })),
  toggleScreenShare: () =>
    set((s) => ({ screenSharing: !s.screenSharing, view: s.screenSharing ? 'grid' : 'screen-share' })),
  toggleHand: () => set((s) => ({ handRaised: !s.handRaised })),
  setSelfSpeaking: (speaking) => set({ isSelfSpeaking: speaking }),
  setSidebar: (sidebar) => set((s) => ({ sidebar: s.sidebar === sidebar ? null : sidebar })),
  setDeviceAvailability: (audio, video) =>
    set({ audioUnavailable: !audio, videoUnavailable: !video }),
  setConnectionQuality: (connectionQuality) => set({ connectionQuality }),
}))

export function useParticipants(): Participant[] {
  return useMeetingStore((s) => s.participants)
}