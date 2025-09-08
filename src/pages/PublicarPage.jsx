import { useEffect, useState } from 'react';
import '../styles/stylePublicar.css'; 

function PublicarServicio() {
  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    area: "",
    provincia: "",
    localidad: "",
    categoria: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const diasSemana = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/provincia")
      .then(res => res.json())
      .then(data => setProvincias(data));
    fetch("http://localhost:3000/categoria")
      .then(res => res.json())
      .then(data => setCategorias(data));
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
    if (disponibilidades.find(d => d.dia === dia)) {
      setDisponibilidades(disponibilidades.filter(d => d.dia !== dia));
    } else {
      setDisponibilidades([...disponibilidades, { dia, franjas: [{ inicio: '', fin: '' }] }]);
    }
  };

  const agregarFranja = dia => {
    setDisponibilidades(disponibilidades.map(d => 
      d.dia === dia ? { ...d, franjas: [...d.franjas, { inicio: '', fin: '' }] } : d
    ));
  };

  const actualizarFranja = (dia, index, campo, valor) => {
    setDisponibilidades(disponibilidades.map(d => {
      if (d.dia === dia) {
        const nuevas = [...d.franjas];
        nuevas[index][campo] = valor;
        return { ...d, franjas: nuevas };
      }
      return d;
    }));
  };

  const handleImagenes = e => {
    setImagenes(e.target.files);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(formulario).forEach(key => formData.append(key, formulario[key]));

    formData.append('disponibilidades', JSON.stringify(disponibilidades));

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
        {diasSemana.map(d => (
          <label key={d}>
            <input
              type="checkbox"
              checked={!!disponibilidades.find(dd => dd.dia === d)}
              onChange={() => toggleDia(d)}
            />
            {d}
          </label>
        ))}

        {disponibilidades.map(d => (
          <div key={d.dia}>
            <h4>{d.dia}</h4>
            {d.franjas.map((f, i) => (
              <div key={i}>
                <input type="time" value={f.inicio} onChange={e => actualizarFranja(d.dia, i, 'inicio', e.target.value)} />
                <input type="time" value={f.fin} onChange={e => actualizarFranja(d.dia, i, 'fin', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={() => agregarFranja(d.dia)}>Agregar franja</button>
          </div>
        ))}
      </div>

      <div className="publicar-form-section">
        <label>Imágenes o videos:</label>
        <input type="file" multiple accept="image/*,video/*" onChange={handleImagenes} />
      </div>

      <button type="submit" className="publicar-submit-button">Publicar servicio</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  )
}

export default PublicarServicio;
