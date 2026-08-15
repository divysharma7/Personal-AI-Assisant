import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddTimerModal from './AddTimerModal'

const { mutateAsync } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}))

vi.mock('@/hooks/useFocusPresets', () => ({
  useCreatePreset: () => ({ mutateAsync }),
}))

describe('AddTimerModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({})
  })

  it('creates a stopwatch preset through accessible mode controls', async () => {
    const onClose = vi.fn()
    render(<AddTimerModal isOpen onClose={onClose} />)

    const pomo = screen.getByRole('radio', { name: /^Pomo/ })
    const stopwatch = screen.getByRole('radio', { name: 'Stopwatch' })
    expect(pomo).toBeChecked()
    expect(stopwatch).not.toBeChecked()

    fireEvent.click(stopwatch)
    expect(stopwatch).toBeChecked()
    expect(screen.queryByLabelText('Duration in minutes')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Timer name'), {
      target: { value: 'Open-ended deep work' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Open-ended deep work',
        mode: 'stopwatch',
      }))
    })
    expect(mutateAsync.mock.calls[0][0]).not.toHaveProperty('durationMinutes')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('rejects a Pomodoro duration above the API limit', async () => {
    render(<AddTimerModal isOpen onClose={() => undefined} />)

    fireEvent.change(screen.getByLabelText('Timer name'), {
      target: { value: 'Too long' },
    })
    fireEvent.change(screen.getByLabelText('Duration in minutes'), {
      target: { value: '181' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Duration cannot exceed 180 minutes')).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
