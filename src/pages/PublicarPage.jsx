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
  const [mensaje, setMensaje] = useState("");

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

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => console.log("Preview:", ev.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!user) {
      setMensaje("Debes iniciar sesión para publicar un servicio");
      return;
    }

    const formData = new FormData();
    Object.keys(formulario).forEach(key => formData.append(key, formulario[key]));
    formData.append('dias', JSON.stringify(selectedDays));
    formData.append('id_usuario', user.id);

    for (let i = 0; i < imagenes.length; i++) {
      formData.append('imagenes', imagenes[i]);
    }

    try {
      const res = await fetch("http://localhost:3000/servicio", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setMensaje("Servicio publicado correctamente");
      console.log(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al publicar el servicio");
    }
  };

  return (
    <form className="publicar-page" onSubmit={handleSubmit}>
      <h1 className="publicar-titulo">Publicar Servicio</h1>

      <div className="publicar-form-section">
        <h2>Información básica</h2>
        <label>Categoría:</label>
        <select name="categoria" value={formulario.categoria} onChange={handleChange}>
          <option value="">Seleccione</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <label>Título del servicio:</label>
        <input type="text" name="titulo" value={formulario.titulo} onChange={handleChange} />

        <label>Descripción:</label>
        <textarea name="descripcion" value={formulario.descripcion} onChange={handleChange} />
      </div>

      <div className="publicar-form-section">
        <h2>Ubicación</h2>
        <label>Provincia:</label>
        <select name="provincia" value={formulario.provincia} onChange={handleChange}>
          <option value="">Seleccione</option>
          {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        <label>Localidad:</label>
        <select name="localidad" value={formulario.localidad} onChange={handleChange} disabled={!formulario.provincia}>
          <option value="">Seleccione</option>
          {localidades.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>

        <label>Área de servicio:</label>
        <input type="text" name="area" value={formulario.area} onChange={handleChange} />
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
        <h2>Imagenes</h2>
        <input type="file" multiple accept="image/*,video/*" onChange={handleImagenes} />
      </div>

      <button type="submit" className="publicar-submit-button">Publicar servicio</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
}

export default PublicarServicio;
