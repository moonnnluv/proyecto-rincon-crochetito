import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, beforeEach, afterEach, afterAll, expect } from 'vitest'
import Productos from '@/components/Productos/Productos.jsx'

// Helper para envolver con Router
const renderWithRouter = (ui, initialEntries = ['/']) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)

// Guardar originales para restaurar
const originalFetch = global.fetch
const originalConfirm = window.confirm
const originalAlert = window.alert

beforeEach(() => {
  global.fetch = vi.fn()
  window.confirm = vi.fn().mockReturnValue(true)
  window.alert = vi.fn()
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  global.fetch = originalFetch
  window.confirm = originalConfirm
  window.alert = originalAlert
})

describe('Productos.jsx', () => {
  it('carga y muestra productos', async () => {
    const mockData = [
      { id: 1, nombre: 'Teclado', descripcion: 'Mecánico', precio: 19990, activo: true },
      { id: 2, nombre: 'Mouse',   descripcion: 'Óptico',   precio:  9990, activo: false },
    ]
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    renderWithRouter(<Productos />)

    expect(await screen.findByText(/Teclado/i)).toBeInTheDocument()
    expect(screen.getByText(/Mouse/i)).toBeInTheDocument()
  })

  it('permite eliminar/desactivar un producto y refresca la grilla', async () => {
    const mockData = [{ id: 1, nombre: 'Teclado', descripcion: 'Mecánico', precio: 19990, activo: true }]
    // 1) GET inicial
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData })
    // 2) Acción (DELETE/PUT/PATCH según tu implementación)
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    // 3) GET refresco (lista vacía)
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] })

    const user = userEvent.setup()
    renderWithRouter(<Productos />)

    await screen.findByText(/Teclado/i)

    // Puede llamarse "Desactivar" o "Eliminar" según estado/impl
    await user.click(screen.getByRole('button', { name: /(desactivar|eliminar)/i }))
    expect(window.confirm).toHaveBeenCalled()

    // Se realizaron 3 fetch y ya no aparece el producto
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3))
    await waitFor(() => {
      expect(screen.queryByText(/Teclado/i)).not.toBeInTheDocument()
    })
  })

  it('maneja error del fetch mostrando tabla vacía y registrando el error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })

    const { container } = renderWithRouter(<Productos />)

    await waitFor(() => expect(spy).toHaveBeenCalled())
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(0)

    spy.mockRestore()
  })
})
