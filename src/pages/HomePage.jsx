import {Link} from "react-router-dom";
import Buscador from "../components/Buscador";
import "../styles/styleHome.css";
import { FaWater, FaBolt, FaLock, FaCode, FaCut } from "react-icons/fa";
import { MdCleaningServices } from "react-icons/md";

function HomePage () {
    const handleSearch = (filtros) => {
        console.log("Filtros buscados:", filtros);
    };
    
    return (
        <div className="home-page">
            <div className="browser">
                <div className="browser-text">
                    <h1>Encuentra profesionales de confianza cerca de ti</h1>
                    <p>Plomería, electricidad, costura y muchos servicios más a un click de distancia</p>
                </div>
                <Buscador variant="home" onSearch={handleSearch} />
            </div>
            <div className="categories">
                <div className="categories-text">
                    <p>Categorías populares:</p>
                </div>
                <div className="categories-cards">
                    <div className="card">
                        <div className="icon plomeria"><FaWater size={30} color="#098ff6ff"/></div>
                        <p>Plomería</p>
                    </div>
                    <div className="card">
                        <Link to="/results" className="card-link">
                            <div className="icon electricidad"><FaBolt size={30} color="#f9b805ff" /></div>
                            <p>Electricidad</p>
                        </Link>
                    </div>
                    <div className="card">
                        <div className="icon costura"><FaCut size={30} color="#cd6109ff"/></div>
                        <p>Costura</p>
                    </div>
                    <div className="card">
                        <div className="icon limpieza"><MdCleaningServices size={30} color="#1c8d1eff"/></div>
                        <p>Limpieza</p>
                    </div>
                    <div className="card">
                        <div className="icon seguridad"><FaLock size={25} color="#b60d0dff"/></div>
                        <p>Seguridad</p>
                    </div>
                    <div className="card">
                        <div className="icon programacion"><FaCode size={30} color="#930fc8ff"/></div>
                        <p>Programación</p>
                    </div>
                </div>  
            </div>
        </div>
    )
}

export default HomePage;