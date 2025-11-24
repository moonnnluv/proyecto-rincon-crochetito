// src/pages/Checkout.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Checkout from './Checkout.jsx'

// Mock de useCart
const mockUseCart = vi.fn()
vi.mock('../context/cartContext.jsx', () => ({
  useCart: () => mockUseCart(),
}))

// Mock de useNavigate (no lo usamos mucho aquí, pero Checkout lo importa)
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Checkout.jsx', () => {
  beforeEach(() => {
    mockUseCart.mockReset()
    mockNavigate.mockReset?.()
  })

  it('muestra mensaje de carrito vacío y botón cuando no hay items', () => {
    mockUseCart.mockReturnValue({
      items: [],
      total: 0,
      clear: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Checkout />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument()
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /ir a productos/i })
    ).toBeInTheDocument()
  })

  it('cuando hay productos no muestra el mensaje de carrito vacío y renderiza el formulario de compra', () => {
    mockUseCart.mockReturnValue({
      items: [{ id: 1, nombre: 'Llavero honguito', precio: 5000, qty: 1 }],
      total: 5000,
      clear: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Checkout />
      </MemoryRouter>
    )

    // Ya no debe estar el mensaje de carrito vacío
    expect(screen.queryByText(/tu carrito está vacío/i)).toBeNull()

    // Debe mostrar el bloque de "Datos de compra"
    expect(screen.getByText(/datos de compra/i)).toBeInTheDocument()
  })
})
