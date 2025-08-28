export const EditorMode = {
  Simple: 'Simple' as const,
  Advanced: 'Advanced' as const
}

export type EditorModeType = (typeof EditorMode)[keyof typeof EditorMode]
