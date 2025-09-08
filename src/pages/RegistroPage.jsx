import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/styleAuth.css";


function RegistroPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
      if (isAuthenticated) {
        navigate("/");
      }
    }, [isAuthenticated, navigate]);

    const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    provincia: '',
    localidad: '',
    direccion: '',
    contrasena: '',
    confirmarContrasena: '',
});

const [errores, setErrores] = useState({});
const [mensaje, setMensaje] = useState("");
const [tipoMensaje, setTipoMensaje] = useState("");
const [provincias, setProvincias] = useState([]);
const [localidades, setLocalidades] = useState([]);

useEffect(() => {
  fetch("http://localhost:3000/provincia")
  .then(res => res.json())
  .then(data => setProvincias(data))
  .catch(err => console.error("Error cargando provincias:", err));
}, []);

useEffect(() => {
    if (formulario.provincia) {
      fetch(`http://localhost:3000/localidad?id_provincia=${formulario.provincia}`)
        .then(res => res.json())
        .then(data => setLocalidades(data))
        .catch(err => console.error("Error cargando ciudades:", err));
    }
  }, [formulario.provincia]);


function handleChange(event) {
    setFormulario({
      ...formulario,
      [event.target.name]: event.target.value
    });
    setErrores({ ...errores, [event.target.name]: "" });
    setMensaje("");
  }

function validar() {
    const errores = {};
    const nombreApellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^[0-9]{7,15}$/;
    const contrasena = formulario.contrasena;
    const confirmarContrasena = formulario.confirmarContrasena;

     if (!formulario.nombre.trim()) {
      errores.nombre = "Este campo es obligatorio";
    } else if (!nombreApellidoRegex.test(formulario.nombre)) {
      errores.nombre = "Ingrese un nombre válido";
    }

    if (!formulario.apellido.trim()) {
      errores.apellido = "Este campo es obligatorio";
    } else if (!nombreApellidoRegex.test(formulario.apellido)) {
      errores.apellido = "Ingrese un apellido válido";
    }

    if (!formulario.email.trim()) {
      errores.email = "Este campo es obligatorio";
    } else if (!emailRegex.test(formulario.email)) {
      errores.email = "Ingrese un correo electrónico válido";
    }

    if (!formulario.telefono.trim()) {
      errores.telefono = "Este campo es obligatorio";
    } else if (!telefonoRegex.test(formulario.telefono)) {
      errores.telefono = "Ingrese un número de teléfono válido";
    }

    if (!formulario.direccion.trim()) {
      errores.direccion = "Este campo es obligatorio";
    }

    if (!formulario.localidad.trim()) {
      errores.localidad = "Este campo es obligatorio";
    }

    if(!formulario.provincia.trim()) {
      errores.provincia = "Este campo es obligatorio";
    }

    if (!contrasena) {
      errores.contrasena = "Este campo es obligatorio";
    } else {
      if (contrasena.length < 8) errores.contrasena = "La contraseña debe tener al menos 8 caracteres";
      else if (!/[A-Z]/.test(contrasena)) errores.contrasena = "Debe incluir una letra mayúscula";
      else if (!/[a-z]/.test(contrasena)) errores.contrasena = "Debe incluir una letra minúscula";
      else if (!/[0-9]/.test(contrasena)) errores.contrasena = "Debe incluir un número";
    }

    if (!confirmarContrasena) {
      errores.confirmarContrasena = "Este campo es obligatorio";
    } else if (contrasena !== confirmarContrasena) {
      errores.confirmarContrasena = "Las contraseñas no coinciden";
    }


    return errores;
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const erroresValidacion = validar();

    if (Object.keys(erroresValidacion).length === 0) {

      setErrores({});

      try {

      const response = await fetch("http://localhost:3000/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formulario.nombre,
          apellido: formulario.apellido,
          email: formulario.email,
          telefono: formulario.telefono,
          localidad: formulario.localidad,
          direccion: formulario.direccion,
          contrasena: formulario.contrasena
        }),
      });

       const data = await response.json();

       if (response.ok) {
        setMensaje("Usuario registrado correctamente");
        setTipoMensaje("exito");
        setFormulario({
          nombre: "",
          apellido: "",
          email: "",
          telefono: "",
          direccion: "",
          ciudad: "",
          contrasena: "",
          confirmarContrasena: "",
        });

        setTimeout(() => {
            navigate("/login");
        }, 1000);

      } else {
        setMensaje(data.message || "Error al registrar usuario");
        setTipoMensaje("error");
      }

      } catch (error) {
      console.error(error);
      setMensaje("Error de conexión con el servidor");
      setTipoMensaje("error");
    }

    } else {
      setErrores(erroresValidacion);
      setMensaje("No se ha podido registrar el usuario");
      setTipoMensaje("error");
    }
}

return (
    <form noValidate onSubmit={handleSubmit}>
      <div className='fila'>
        <div className='campo'>
            <label>Nombre:</label>
            <input
            type= "text"
            name = "nombre"
            value = {formulario.nombre}
            onChange={handleChange}
            className={errores.nombre ? "input-error" : ""}
            />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
        </div>
        <div className='campo'>
            <label>Apellido:</label>
            <input
            type = "text"
            name= "apellido"
            value = {formulario.apellido}
            onChange = {handleChange}
            className={errores.apellido ? "input-error" : ""}
            />
            {errores.apellido && <p className="error">{errores.apellido}</p>}
        </div>
      </div>
      <div className='fila'>
        <div className='campo'>
            <label>Correo electrónico:</label>
            <input
            type = "email"
            name = "email"
            value = {formulario.email}
            onChange={handleChange}
            className={errores.email ? "input-error" : ""}
            />
            {errores.email && <p className="error">{errores.email}</p>}
        </div>
        <div className='campo'>
            <label>Teléfono:</label>
            <input
            type = "tel"
            name = "telefono"
            value = {formulario.telefono}
            onChange={handleChange}
            className={errores.telefono ? "input-error" : ""}
            />
            {errores.telefono && <p className="error">{errores.telefono}</p>}
        </div>
      </div>
      <div className='fila'>
        <div className='campo'>
            <label>Provincia:</label>
            <select
              name="provincia"
              value={formulario.provincia}
              onChange={handleChange}
              className={errores.provincia ? "input-error" : ""}
            
            >
            <option value="">Seleccione una provincia</option>
            {provincias.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))}
            </select>
            {errores.provincia && <p className="error">{errores.provincia}</p>}
        </div>
         <div className='campo'>
            <label>Localidad:</label>
            <select
              name='localidad'
              value={formulario.localidad}
              onChange={handleChange}
              className={errores.localidad ? "input-error" : ""}
              disabled={!formulario.provincia}
            >
              <option value="">Seleccione una ciudad</option>
              {localidades.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nombre}
                </option>
              ))}
            </select>
            {errores.localidad && <p className="error">{errores.localidad}</p>}
        </div>
        <div className='campo'>
            <label>Dirección:</label>
            <input
            type = "text"
            name = "direccion"
            value = {formulario.direccion}
            onChange={handleChange}
            className={errores.direccion ? "input-error" : ""}
            />
            {errores.direccion && <p className="error">{errores.direccion}</p>}
        </div>
      </div>
      <div className='fila'>
         <div className='campo'>
            <label>Contraseña:</label>
            <input
            type = "password"
            name = "contrasena"
            value = {formulario.contrasena}
            onChange={handleChange}
            className={errores.contrasena ? "input-error" : ""}
            />
            {errores.contrasena && <p className="error">{errores.contrasena}</p>}
        </div>
        <div className='campo'>
            <label>Confirmar Contraseña:</label>
            <input
            type = "password"
            name = "confirmarContrasena"
            value = {formulario.confirmarContrasena}
            onChange={handleChange}
            className={errores.confirmarContrasena ? "input-error" : ""}
            />
            {errores.confirmarContrasena && <p className="error">{errores.confirmarContrasena}</p>}
        </div>
      </div>

        <button className="submit" type="submit">Crear Cuenta</button>
        {mensaje && (
            <p className={`mensaje ${tipoMensaje === "exito" ? "exito" : "error"}`}>
                {mensaje}
            </p>
          )}
    </form>
);
}


export default RegistroPage;

