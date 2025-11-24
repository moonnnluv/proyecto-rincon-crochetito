// src/components/ProtectedRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import ProtectedRoute from '@/components/ProtectedRoute.jsx'

// Mock de authContext
const mockAuth = { user: null }
vi.mock('@/context/authContext.jsx', () => ({
  useAuth: () => mockAuth,
}))

function renderWithRoutes(roles) {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/admin" element={<h1>Zona Admin</h1>} />
        </Route>
        <Route path="/login" element={<h1>Pantalla Login</h1>} />
        <Route path="/" element={<h1>Inicio</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirige a /login si no hay usuario autenticado', () => {
    mockAuth.user = null

    renderWithRoutes(['ADMIN'])

    expect(screen.getByText(/pantalla login/i)).toBeInTheDocument()
  })

  it('muestra el contenido protegido cuando el rol está permitido', () => {
    mockAuth.user = { email: 'admin@rc.cl', rol: 'ADMIN' }

    renderWithRoutes(['ADMIN', 'SUPERADMIN'])

    expect(screen.getByText(/zona admin/i)).toBeInTheDocument()
  })

  it('redirige a "/" cuando el rol NO está permitido', () => {
    mockAuth.user = { email: 'cliente@rc.cl', rol: 'CLIENTE' }

    renderWithRoutes(['ADMIN', 'SUPERADMIN'])

    expect(screen.getByText(/inicio/i)).toBeInTheDocument()
  })
})
