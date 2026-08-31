import { describe, it, expect } from 'vitest'
import { signUpSchema, signInSchema, forgotPasswordSchema } from '@/lib/validations/auth'

describe('Auth Validations', () => {
  describe('signUpSchema', () => {
    it('should validate correct signup data', async () => {
      const validData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: 'John Doe',
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: 'John Doe',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject weak password', async () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        name: 'John Doe',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', async () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!',
        name: 'John Doe',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty name', async () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: '',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('signInSchema', () => {
    it('should validate correct signin data', async () => {
      const validData = {
        email: 'user@example.com',
        password: 'Password123!',
      }

      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', async () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate recovery email', async () => {
      const validData = {
        email: 'user@example.com',
      }

      const result = forgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid recovery email', async () => {
      const invalidData = {
        email: 'not-an-email',
      }

      const result = forgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
