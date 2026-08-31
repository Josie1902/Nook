import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '@/components/features/auth/signup/SignupForm'
import { AuthProvider } from '@/components/features/auth/AuthContext'

// Signup form is expected to be within AuthProvider
const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider notifyFieldsFilled={vi.fn()}>
      {component}
    </AuthProvider>
  )
}

describe('SignupForm Component', () => {
  it('should render signup form', () => {
    renderWithAuth(<SignupForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/confirm password/i)
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /create account/i,
      })
    ).toBeInTheDocument()
  })

  it('should accept name input', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SignupForm />)

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    await user.type(nameInput, 'John Doe')

    expect(nameInput.value).toBe('John Doe')
  })

  it('should accept email input', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SignupForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    await user.type(emailInput, 'john@example.com')

    expect(emailInput.value).toBe('john@example.com')
  })

  it('should accept password input', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement
    await user.type(passwordInput, 'SecurePass123!')

    expect(passwordInput.value).toBe('SecurePass123!')
  })

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup()

    renderWithAuth(<SignupForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmInput, 'SecurePass123!')

    await user.click(submitButton)

    expect(
      await screen.findByText(/name is required/i)
    ).toBeInTheDocument()
  })

  it('should show error for mismatched passwords', async () => {
    const user = userEvent.setup()

    renderWithAuth(<SignupForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmInput, 'DifferentPass123!')

    await user.click(submitButton)

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument()
  })

  it('should show error for weak password', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SignupForm />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', {  name: /create account/i, })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'weak')
    await user.type(confirmInput, 'weak')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 16 characters/i)
      ).toBeInTheDocument()
    })
  })
  
  it('should display signin link', () => {
    renderWithAuth(<SignupForm />)

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })
})
