import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SigninForm } from '@/components/features/auth/siginin/SigninForm'
import { AuthProvider } from '@/components/features/auth/AuthContext'

// Signin form is expected to be within AuthProvider
const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider notifyFieldsFilled={vi.fn()}>
      {component}
    </AuthProvider>
  )
}

describe('SigninForm Component', () => {
  it('should render signin form', () => {
    renderWithAuth(<SigninForm />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Sign in' })
    ).toBeInTheDocument()
  })

  it('should accept email input', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SigninForm />)

    const emailInput = screen.getByLabelText('Email')

    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should accept password input', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SigninForm />)

    const passwordInput = screen.getByLabelText('Password')

    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('should show error for invalid email format', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SigninForm />)

    const emailInput = screen.getByLabelText('Email')

    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', {
      name: 'Sign in',
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument()
    })
  })

  it('should display forgot password link', () => {
    renderWithAuth(<SigninForm />)

    expect(
      screen.getByRole('link', {
        name: /forgot password/i,
      })
    ).toBeInTheDocument()
  })

  it('should display signup link', () => {
    renderWithAuth(<SigninForm />)

    expect(
      screen.getByRole('link', {
        name: /create an account/i,
      })
    ).toBeInTheDocument()
  })
})