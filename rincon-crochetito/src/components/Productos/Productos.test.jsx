import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Productos } from './Productos'

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Productos.jsx', () => {
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

  test('carga y muestra productos correctamente', async () => {
    const mockData = [
      { id: 1, nombre: 'Teclado', descripcion: 'Mecánico', precio: 19990, activo: true },
      { id: 2, nombre: 'Mouse', descripcion: 'Óptico', precio: 9990, activo: 'false' }
    ]

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    renderWithRouter(<Productos />)

    expect(await screen.findByRole('heading', { name: /inventario de productos/i })).toBeInTheDocument()
    expect(await screen.findByText('Teclado')).toBeInTheDocument()
    expect(await screen.findByText('Mouse')).toBeInTheDocument()

     
    const crearBtn = screen.getByRole('link', { name: /crear producto/i })
    expect(crearBtn).toHaveAttribute('href', '/crear-producto')

     
    const mouseRow = screen.getByText('Mouse').closest('tr')
    expect(mouseRow).toHaveStyle({ opacity: '0.5' })

    const editBtn = within(mouseRow).getByRole('button', { name: /editar producto/i })
    expect(editBtn).toBeDisabled()
  })

  test('desactiva producto correctamente', async () => {
    const initialData = [
      { id: 1, nombre: 'Teclado', descripcion: 'Mecánico', precio: 19990, activo: true }
    ]

    const afterPatchData = [
      { id: 1, nombre: 'Teclado', descripcion: 'Mecánico', precio: 19990, activo: false }
    ]

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => initialData })  
      .mockResolvedValueOnce({ ok: true, json: async () => afterPatchData[0] })  
      .mockResolvedValueOnce({ ok: true, json: async () => afterPatchData })  

    renderWithRouter(<Productos />)

     
    await screen.findByText('Teclado')

    const desactivarBtn = screen.getByRole('button', { name: /desactivar/i })
    const user = userEvent.setup()

    await user.click(desactivarBtn)

     expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Teclado'))
     await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/productos/1/desactivar',
        expect.objectContaining({ method: 'PATCH' })
      )
    })

     await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Producto desactivado exitosamente')
    })

     expect(global.fetch).toHaveBeenNthCalledWith(3, 'http://localhost:8080/api/productos')
  })

  test('no desactiva producto si usuario cancela confirmación', async () => {
    window.confirm = vi.fn().mockReturnValue(false)
    const mockData = [{ id: 1, nombre: 'Monitor', descripcion: '24 pulgadas', precio: 99900, activo: true }]
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData })

    renderWithRouter(<Productos />)

    await screen.findByText('Monitor')

    const desactivarBtn = screen.getByRole('button', { name: /desactivar/i })
    const user = userEvent.setup()
    await user.click(desactivarBtn)

    
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(window.alert).not.toHaveBeenCalled()
  })
})
