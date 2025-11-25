// src/components/__tests__/Header.test.jsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import Header from '@/components/Header.jsx'

// --- Mocks ---
const mockAuth = { user: null, logout: vi.fn() }
vi.mock('@/context/authContext.jsx', () => ({ useAuth: () => mockAuth }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Helper para renderizar Header con rutas mínimas
function renderPage(initialEntries = ['/'], headerProps = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Header {...headerProps} />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/productos" element={<h1>Productos</h1>} />
        <Route path="/nosotros" element={<h1>Nosotros</h1>} />
        <Route path="/blogs" element={<h1>Blogs</h1>} />
        <Route path="/contacto" element={<h1>Contacto</h1>} />
        <Route path="/carrito" element={<h1>Carrito</h1>} />
        <Route path="/mi-cuenta" element={<h1>Mi cuenta</h1>} />
        <Route path="/admin" element={<h1>Panel Admin</h1>} />
        <Route path="/vendedor" element={<h1>Panel Vendedor</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

// --- Tests ---

it('renderiza marca y todos los links con sus href correctos', () => {
  mockAuth.user = null
  renderPage()

  expect(screen.getByRole('link', { name: /rincón crochetito/i }))
    .toHaveAttribute('href', '/')

  expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  expect(screen.getByRole('link', { name: /productos/i })).toHaveAttribute('href', '/productos')
  expect(screen.getByRole('link', { name: /nosotros/i })).toHaveAttribute('href', '/nosotros')
  expect(screen.getByRole('link', { name: /blogs/i })).toHaveAttribute('href', '/blogs')
  expect(screen.getByRole('link', { name: /contacto/i })).toHaveAttribute('href', '/contacto')
  expect(screen.getByRole('link', { name: /carrito/i })).toHaveAttribute('href', '/carrito')
})

it('el botón toggle tiene los atributos de Bootstrap', () => {
  mockAuth.user = null
  const { container } = renderPage()

  const toggler = container.querySelector('button.navbar-toggler')
  expect(toggler).toBeInTheDocument()
  expect(toggler).toHaveAttribute('data-bs-toggle', 'collapse')
  expect(toggler).toHaveAttribute('data-bs-target', '#mainNav')
})

it('navega a /productos al hacer click en el link', async () => {
  mockAuth.user = null
  const user = userEvent.setup()
  renderPage(['/'])

  await user.click(screen.getByRole('link', { name: /productos/i }))
  expect(screen.getByRole('heading', { name: /productos/i })).toBeInTheDocument()
})

it('marca activo el link según la ruta actual', () => {
  mockAuth.user = null
  renderPage(['/productos'])
  expect(screen.getByRole('link', { name: /productos/i })).toHaveClass('active')
})

it('muestra badge del carrito solo si cartCount > 0', () => {
  mockAuth.user = null
  const { rerender } = renderPage(['/'], { cartCount: 0 })

  const cart = screen.getByRole('link', { name: /carrito/i })
  expect(within(cart).queryByText('0')).not.toBeInTheDocument()

  // re-render del mismo árbol
  rerender(
    <MemoryRouter initialEntries={['/']}>
      <Header cartCount={3} />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/carrito" element={<h1>Carrito</h1>} />
      </Routes>
    </MemoryRouter>
  )

  const cart2 = screen.getByRole('link', { name: /carrito/i })
  expect(within(cart2).getByText('3')).toBeInTheDocument()
})

it('cuando hay usuario muestra botón de panel según el rol', () => {
  // ADMIN
  mockAuth.user = { email: 'admin@rc.cl', rol: 'ADMIN' }
  const { rerender } = renderPage()
  let adminLinks = screen.getAllByRole('link', { name: /panel admin/i })
  expect(adminLinks.some(a => a.getAttribute('href') === '/admin')).toBe(true)

  // VENDEDOR
  mockAuth.user = { email: 'vendedor@rc.cl', rol: 'VENDEDOR' }
  rerender(
    <MemoryRouter initialEntries={['/']}>
      <Header />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/vendedor" element={<h1>Panel Vendedor</h1>} />
      </Routes>
    </MemoryRouter>
  )
  const vendLinks = screen.getAllByRole('link', { name: /panel vendedor/i })
  expect(vendLinks.some(a => a.getAttribute('href') === '/vendedor')).toBe(true)

  // CLIENTE
  mockAuth.user = { email: 'cliente@rc.cl', rol: 'CLIENTE' }
  rerender(
    <MemoryRouter initialEntries={['/']}>
      <Header />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/mi-cuenta" element={<h1>Mi cuenta</h1>} />
      </Routes>
    </MemoryRouter>
  )
  const cuentaLinks = screen.getAllByRole('link', { name: /mi cuenta/i })
  expect(cuentaLinks.some(a => a.getAttribute('href') === '/mi-cuenta')).toBe(true)
})

it('al cerrar sesión llama logout y navega a "/"', async () => {
  const user = userEvent.setup()
  mockAuth.user = { email: 'user@rc.cl', rol: 'CLIENTE' }
  mockAuth.logout = vi.fn()

  renderPage()

  await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))
  expect(mockAuth.logout).toHaveBeenCalledTimes(1)
  expect(mockNavigate).toHaveBeenCalledWith('/')
})
