import { Navbar } from "../../componentes/Navbar/Navbar";
import { Productos } from "../../componentes/Productos/Productos";


export function Inventario(){

    return (

        <div className="container">
            <Navbar/>
            <Productos/>
        </div>
        
    )
}