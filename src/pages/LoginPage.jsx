import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/styleAuth.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const [formulario, setFormulario] = useState({
    email: '',
    contrasena: '',
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formulario.email.trim()) {
      errores.email = "Este campo es obligatorio";
    } else if (!emailRegex.test(formulario.email)) {
      errores.email = "Ingrese un correo electrónico válido";
    }

    if (!formulario.contrasena) {
      errores.contrasena = "Este campo es obligatorio";
    }

    return errores;
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  const erroresValidacion = validar();

  if (Object.keys(erroresValidacion).length === 0) {

    setErrores({});

    try {

        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: formulario.email,
                contrasena: formulario.contrasena
            }),
        });

        const data = await response.json();

        if(response.ok) {
            login(data.token, data.usuario);
            setMensaje("Inicio exitoso.");
            setTipoMensaje("exito");
            setFormulario({
                email:"",
                contrasena:""
            });

            setTimeout(() => {
            navigate("/");
        }, 1000);

        } else {
            setMensaje(data.message || "Correo electrónico o contraseña incorrectos.");
            setTipoMensaje("error");
        }
    } catch (error) {
        console.error(error);
        setMensaje("Error de conexión con el servidor");
        setTipoMensaje("error");
    }

} else {
    setErrores(erroresValidacion);
    setMensaje("No se ha podido iniciar sesión");
    setTipoMensaje("error");
}
};
 

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className='fila'>
        <div className='campo'>
          <label>Correo electrónico:</label>
          <input
            type="email"
            name="email"
            value={formulario.email}
            onChange={handleChange}
            className={errores.email ? "input-error" : ""}
          />
          {errores.email && <p className="error">{errores.email}</p>}
        </div>
      </div>

      <div className='fila'>
        <div className='campo'>
          <label>Contraseña:</label>
          <input
            type="password"
            name="contrasena"
            value={formulario.contrasena}
            onChange={handleChange}
            className={errores.contrasena ? "input-error" : ""}
          />
          {errores.contrasena && <p className="error">{errores.contrasena}</p>}
        </div>
      </div>

      <button className="submit" type="submit">Iniciar Sesión</button>
      {mensaje && (
            <p className={`mensaje ${tipoMensaje === "exito" ? "exito" : "error"}`}>
                {mensaje}
            </p>
          )}
    </form>
  );
}

export default LoginPage;
