import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  RateLimitError,
  getUserMessage,
  ok,
  err,
} from './errors'

describe('AppError', () => {
  it('has correct code and statusCode', () => {
    const error = new AppError('something broke', 'INTERNAL_ERROR', 500)
    expect(error.message).toBe('something broke')
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.name).toBe('AppError')
  })

  it('defaults statusCode to 500', () => {
    const error = new AppError('fail', 'UNKNOWN')
    expect(error.statusCode).toBe(500)
  })

  it('stores details', () => {
    const details = { field: 'email' }
    const error = new AppError('bad', 'BAD', 400, details)
    expect(error.details).toEqual(details)
  })

  it('is an instance of Error', () => {
    const error = new AppError('test', 'TEST')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })
})

describe('NotFoundError', () => {
  it('has 404 status and NOT_FOUND code', () => {
    const error = new NotFoundError('Task', 'abc-123')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toContain('Task')
    expect(error.message).toContain('abc-123')
    expect(error.name).toBe('NotFoundError')
  })

  it('is an instance of AppError', () => {
    const error = new NotFoundError('List', 'xyz')
    expect(error).toBeInstanceOf(AppError)
  })
})

describe('ValidationError', () => {
  it('has 422 status and VALIDATION_ERROR code', () => {
    const error = new ValidationError('Invalid input')
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.message).toBe('Invalid input')
  })

  it('stores field-level details', () => {
    const details = [
      { field: 'title', message: 'Required' },
      { field: 'email', message: 'Invalid format' },
    ]
    const error = new ValidationError('Validation failed', details)
    expect(error.details).toEqual(details)
  })
})

describe('UnauthorizedError', () => {
  it('has 401 status and UNAUTHORIZED code', () => {
    const error = new UnauthorizedError()
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.message).toBe('Authentication required')
  })

  it('accepts custom reason', () => {
    const error = new UnauthorizedError('Token expired')
    expect(error.message).toBe('Token expired')
  })
})

describe('RateLimitError', () => {
  it('has 429 status and RATE_LIMITED code', () => {
    const error = new RateLimitError()
    expect(error.statusCode).toBe(429)
    expect(error.code).toBe('RATE_LIMITED')
  })
})

describe('getUserMessage', () => {
  it('returns user-friendly text for NOT_FOUND', () => {
    expect(getUserMessage('NOT_FOUND')).toBe('The requested item could not be found.')
  })

  it('returns user-friendly text for UNAUTHORIZED', () => {
    expect(getUserMessage('UNAUTHORIZED')).toBe('Please sign in to continue.')
  })

  it('returns user-friendly text for VALIDATION_ERROR', () => {
    expect(getUserMessage('VALIDATION_ERROR')).toBe('Please check your input and try again.')
  })

  it('returns user-friendly text for RATE_LIMITED', () => {
    expect(getUserMessage('RATE_LIMITED')).toBe('Too many requests. Please wait a moment.')
  })

  it('returns fallback message for unknown codes', () => {
    expect(getUserMessage('TOTALLY_UNKNOWN_CODE')).toBe('Something went wrong. Please try again later.')
  })
})

describe('Result pattern', () => {
  it('ok() produces a success result', () => {
    const result = ok(42)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBe(42)
    }
  })

  it('ok() works with complex values', () => {
    const result = ok({ id: 'abc', name: 'Test' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual({ id: 'abc', name: 'Test' })
    }
  })

  it('err() produces a failure result', () => {
    const error = new AppError('failed', 'FAIL', 500)
    const result = err(error)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(error)
      expect(result.error.code).toBe('FAIL')
    }
  })

  it('err() works with string errors', () => {
    const result = err('something went wrong')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('something went wrong')
    }
  })
})
