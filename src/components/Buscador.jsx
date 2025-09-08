import { useState, useEffect } from "react";

function Buscador({ onSearch }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState("");

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
      .then((res) => res.json())
      .then((data) => {
        const provinciasOrdenadas = data.provincias.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
        setProvincias(provinciasOrdenadas);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (provinciaSeleccionada) {
      fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinciaSeleccionada}&max=100`
      )
        .then((res) => res.json())
        .then((data) => {
          const localidadesOrdenadas = data.localidades.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          );
          setLocalidades(localidadesOrdenadas);
        })
        .catch((err) => console.error(err));
    } else {
      setLocalidades([]);
      setLocalidadSeleccionada("");
    }
  }, [provinciaSeleccionada]);

  const handleBuscar = () => {
    if (onSearch) {
      onSearch({ nombre, categoria, provinciaSeleccionada, localidadSeleccionada });
    }
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
          <option value=""></option>
          <option value="electricidad">Electricidad</option>
          <option value="plomería">Plomería</option>
          <option value="jardinería">Jardinería</option>
        </select>
      </div>

      <div className="form-group">
        <p className="item-text">Provincia:</p>
        <select
          value={provinciaSeleccionada}
          onChange={(e) => setProvinciaSeleccionada(e.target.value)}
        >
          <option value=""></option>
          {provincias.map((prov) => (
            <option key={prov.id} value={prov.nombre}>
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
        >
          <option value=""></option>
          {localidades.map((loc) => (
            <option key={loc.id} value={loc.nombre}>
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
