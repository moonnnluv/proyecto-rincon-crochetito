export default function Footer() {
    return (
        <footer className="container-fluid px-3 py-4 bg-dark text-light text-center mt-4">
        <p className="mb-1">&copy; {new Date().getFullYear()} Rincón Crochetito</p>
        <a href="https://github.com/moonnnluv" target="_blank" rel="noreferrer" className="text-light text-decoration-none">
            Hecho con ❤️ por Ale
        </a>
        </footer>
    );
}
