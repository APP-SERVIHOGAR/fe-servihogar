import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Buscador({ onSearch }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState("");

  const navigate = useNavigate();

  useEffect (() => {
    fetch("http://localhost:3000/categoria")
    .then((res) => res.json())
    .then((data) => setCategorias(data))
    .catch((err) => console.error(err));
  })

  useEffect(() => {
    fetch("http://localhost:3000/provincia")
      .then((res) => res.json())
      .then((data) => setProvincias(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (provinciaSeleccionada) {
      fetch(`http://localhost:3000/localidad?id_provincia=${provinciaSeleccionada}`)
        .then((res) => res.json())
        .then((data) => setLocalidades(data))
        .catch((err) => console.error(err));
    } else {
      setLocalidades([]);
      setLocalidadSeleccionada("");
    }
  }, [provinciaSeleccionada]);

  const handleBuscar = () => {
    const filtros = {
      nombre,
      categoria,
      provinci: provinciaSeleccionada,
      localidad: localidadSeleccionada,
    }

    if (onSearch) {
      onSearch(filtros);
    }

    const queryString = new URLSearchParams(filtros).toString();
    navigate(`/resultados?${queryString}`);
  };

  return (
    <div className="container-browser">
      <div className="form-group">
        <p className="item-text">¿Qué servicio necesitas?</p>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div className="form-group">
        <p className="item-text">Categoría:</p>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Seleccione una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <p className="item-text">Provincia:</p>
        <select
          value={provinciaSeleccionada}
          onChange={(e) => setProvinciaSeleccionada(e.target.value)}
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <p className="item-text">Localidad:</p>
        <select
          value={localidadSeleccionada}
          onChange={(e) => setLocalidadSeleccionada(e.target.value)}
          disabled={!provinciaSeleccionada}
        >
          <option value="">Seleccione una localidad</option>
          {localidades.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <p className="item-text">&nbsp;</p>
        <button className="btn-buscar" onClick={handleBuscar}>
          Buscar
        </button>
      </div>
    </div>
  );
}

export default Buscador;
