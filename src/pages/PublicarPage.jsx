import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import '../styles/stylePublicar.css'; 

function PublicarServicio() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    area: "",
    provincia: "",
    localidad: "",
    categoria: "",
  });

  const { user, isAuthenticated } = useContext(AuthContext);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [dias, setDias] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetch("http://localhost:3000/provincia")
      .then(res => res.json())
      .then(data => setProvincias(data));
    fetch("http://localhost:3000/categoria")
      .then(res => res.json())
      .then(data => setCategorias(data));
    fetch("http://localhost:3000/dia")
      .then(res => res.json())
      .then(data => setDias(data));
  }, []);

  useEffect(() => {
    if (formulario.provincia) {
      fetch(`http://localhost:3000/localidad?id_provincia=${formulario.provincia}`)
        .then(res => res.json())
        .then(data => setLocalidades(data));
    }
  }, [formulario.provincia]);

  const handleChange = e => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
    setMensaje("");
  };

  const toggleDia = dia => {
    if (selectedDays.find(d => d.idDia === dia.id)) {
      setSelectedDays(selectedDays.filter(d => d.idDia !== dia.id));
    } else {
      setSelectedDays([...selectedDays, { idDia: dia.id, franjas: [{ inicio: '', fin: '' }] }]);
    }
  };

  const agregarFranja = idDia => {
    setSelectedDays(selectedDays.map(d => 
      d.idDia === idDia ? { ...d, franjas: [...d.franjas, { inicio: '', fin: '' }] } : d
    ));
  };

  const actualizarFranja = (idDia, index, campo, valor) => {
    setSelectedDays(selectedDays.map(d => {
      if (d.idDia === idDia) {
        const nuevas = [...d.franjas];
        nuevas[index][campo] = valor;
        return { ...d, franjas: nuevas };
      }
      return d;
    }));
  };

  const handleImagenes = e => {
    const files = Array.from(e.target.files);
    setImagenes(files);
  };

  function validarFormulario() {
    const newErrors = {};

    if (!formulario.categoria) {
      newErrors.categoria = "Debe seleccionar una categoría";
    }

    if (!formulario.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    }

    if (!formulario.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (formulario.descripcion.trim().length < 20) {
      newErrors.descripcion = "La descripción debe tener al menos 20 caracteres";
    }

    if (!formulario.provincia) {
      newErrors.provincia = "Debe seleccionar una provincia";
    }

    if (!formulario.localidad) {
      newErrors.localidad = "Debe seleccionar una localidad";
    }

    if (!formulario.area.trim()) {
      newErrors.area = "Debe indicar un área de servicio";
    }

    if (selectedDays.length === 0) {
      newErrors.dias = "Debe seleccionar al menos un día";
    } else {
      const tieneFranja = selectedDays.some(d =>
        d.franjas.some(f => f.inicio && f.fin)
      );
      if (!tieneFranja) {
        newErrors.franjas = "Debe agregar al menos una franja horaria válida";
      }
    }

    return newErrors;
  }

  const handleSubmit = async e => {
    e.preventDefault();

    if (!user) {
      setMensaje("Debes iniciar sesión para publicar un servicio");
      setTipoMensaje("error");
      return;
    }

    const erroresValidacion = validarFormulario();

    if (Object.keys(erroresValidacion).length === 0) {
      setErrores({});
      try {
        const formData = new FormData();
        Object.keys(formulario).forEach(key => formData.append(key, formulario[key]));
        formData.append('dias', JSON.stringify(selectedDays));
        formData.append('id_usuario', user.id);

        for (let i = 0; i < imagenes.length; i++) {
          formData.append('imagenes', imagenes[i]);
        }

        const res = await fetch("http://localhost:3000/servicio", {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          setMensaje("Servicio publicado correctamente");
          setTipoMensaje("exito");
          console.log(data);
        } else {
          setMensaje(data.message || "Error al publicar servicio");
          setTipoMensaje("error");
        }
      } catch (err) {
        console.error(err);
        setMensaje("Error de conexión con el servidor");
        setTipoMensaje("error");
      }
    } else {
      setErrores(erroresValidacion);
      setMensaje("No se pudo publicar el servicio");
      setTipoMensaje("error");
    }
  };

  return (
    <form className="publicar-page" onSubmit={handleSubmit} noValidate>
      <h1 className="publicar-titulo">Publicar Servicio</h1>

      <div className="publicar-form-section">
        <h2>Información básica</h2>

        <label>Categoría:</label>
        <select
          name="categoria"
          value={formulario.categoria}
          onChange={handleChange}
          className={errores.categoria ? "input-error" : ""}
        >
          <option value="">Seleccione</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        {errores.categoria && <p className="error">{errores.categoria}</p>}

        <label>Título del servicio:</label>
        <input
          type="text"
          name="titulo"
          value={formulario.titulo}
          onChange={handleChange}
          className={errores.titulo ? "input-error" : ""}
        />
        {errores.titulo && <p className="error">{errores.titulo}</p>}

        <label>Descripción:</label>
        <textarea
          name="descripcion"
          value={formulario.descripcion}
          onChange={handleChange}
          className={errores.descripcion ? "input-error" : ""}
        />
        {errores.descripcion && <p className="error">{errores.descripcion}</p>}
      </div>

      <div className="publicar-form-section">
        <h2>Ubicación</h2>

        <label>Provincia:</label>
        <select
          name="provincia"
          value={formulario.provincia}
          onChange={handleChange}
          className={errores.provincia ? "input-error" : ""}
        >
          <option value="">Seleccione</option>
          {provincias.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        {errores.provincia && <p className="error">{errores.provincia}</p>}

        <label>Localidad:</label>
        <select
          name="localidad"
          value={formulario.localidad}
          onChange={handleChange}
          className={errores.localidad ? "input-error" : ""}
          disabled={!formulario.provincia}
        >
          <option value="">Seleccione</option>
          {localidades.map(l => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
        {errores.localidad && <p className="error">{errores.localidad}</p>}

        <label>Área de servicio:</label>
        <input
          type="text"
          name="area"
          value={formulario.area}
          onChange={handleChange}
          className={errores.area ? "input-error" : ""}
        />
        {errores.area && <p className="error">{errores.area}</p>}
      </div>

      <div className="publicar-form-section">
        <h2>Días y horarios</h2>
        {dias.map(d => (
          <label key={d.id} className='checkboxes'>
            <input
              type="checkbox"
              checked={!!selectedDays.find(dd => dd.idDia === d.id)}
              onChange={() => toggleDia(d)}
            />
            {d.nombre}
          </label>
        ))}
        {errores.dias && <p className="error">{errores.dias}</p>}
        {errores.franjas && <p className="error">{errores.franjas}</p>}

        {selectedDays.map(d => (
          <div key={d.idDia} className='franja-dia'>
            <h4>{dias.find(day => day.id === d.idDia)?.nombre}</h4>
            {d.franjas.map((f, i) => (
              <div key={i} className='franja-horarios'>
                <input type="time" value={f.inicio} onChange={e => actualizarFranja(d.idDia, i, 'inicio', e.target.value)} />
                <input type="time" value={f.fin} onChange={e => actualizarFranja(d.idDia, i, 'fin', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={() => agregarFranja(d.idDia)}>Agregar franja</button>
          </div>
        ))}
      </div>

      <div className="publicar-form-section">
        <h2>Imágenes (opcional)</h2>
        <input type="file" multiple accept="image/*,video/*" onChange={handleImagenes} />
      </div>

      <button type="submit" className="publicar-submit-button">Publicar servicio</button>
      {mensaje && (
        <p className={`mensaje ${tipoMensaje === "exito" ? "exito" : "error"}`}>
          {mensaje}
        </p>
      )}
    </form>
  );
}

export default PublicarServicio;
