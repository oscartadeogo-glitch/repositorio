// =============================================
// CONFIGURACIÓN — edita estos valores
// =============================================
const GITHUB_TOKEN = window.GITHUB_TOKEN;    // Token cargado desde config.js (no subido a GitHub)
const REPO_OWNER   = "oscartadeogo-glitch";  // Tu usuario de GitHub
const REPO_NAME    = "repositorio";           // Nombre del repositorio
const FILE_PATH    = "datos.json";           // Archivo donde se guardan los datos
// =============================================

const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

const headers = {
  "Authorization": `token ${GITHUB_TOKEN}`,
  "Accept": "application/vnd.github+json",
  "Content-Type": "application/json"
};

// Carga los registros al iniciar la página
window.addEventListener("DOMContentLoaded", cargarDatos);

async function obtenerArchivo() {
  const res = await fetch(API_URL, { headers });
  if (res.status === 404) return { datos: [], sha: null };
  if (!res.ok) throw new Error("Error al leer el archivo en GitHub");
  const json = await res.json();
  const contenido = JSON.parse(atob(json.content));
  return { datos: contenido, sha: json.sha };
}

async function guardar() {
  const nombre   = document.getElementById("nombre").value.trim();
  const edad     = document.getElementById("edad").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const btn      = document.getElementById("btnGuardar");

  if (!nombre || !edad || !telefono) {
    mostrarMensaje("Por favor completa todos los campos.", "err");
    return;
  }

  btn.disabled = true;
  mostrarMensaje("Guardando...", "");

  try {
    const { datos, sha } = await obtenerArchivo();

    datos.push({ nombre, edad: Number(edad), telefono });

    const body = {
      message: `Agregar registro: ${nombre}`,
      content: btoa(JSON.stringify(datos, null, 2)),
      ...(sha && { sha })
    };

    const res = await fetch(API_URL, {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("No se pudo guardar en GitHub");

    mostrarMensaje("¡Guardado correctamente!", "ok");
    document.getElementById("nombre").value = "";
    document.getElementById("edad").value = "";
    document.getElementById("telefono").value = "";
    cargarDatos();

  } catch (e) {
    mostrarMensaje("Error: " + e.message, "err");
  } finally {
    btn.disabled = false;
  }
}

async function cargarDatos() {
  const cargando = document.getElementById("cargando");
  const tabla    = document.getElementById("tabla");
  const tbody    = document.getElementById("tbody");
  const empty    = document.getElementById("empty");
  const conteo   = document.getElementById("conteo");

  cargando.style.display = "block";
  tabla.style.display = "none";
  empty.style.display = "none";

  try {
    const { datos } = await obtenerArchivo();
    tbody.innerHTML = "";
    cargando.style.display = "none";
    conteo.textContent = datos.length;

    if (datos.length === 0) {
      empty.style.display = "block";
      return;
    }

    datos.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="num-cell">${i + 1}</td><td>${r.nombre}</td><td>${r.edad}</td><td>${r.telefono}</td>`;
      tbody.appendChild(tr);
    });

    tabla.style.display = "table";

  } catch (e) {
    cargando.textContent = "Error al cargar datos: " + e.message;
  }
}

function mostrarMensaje(texto, tipo) {
  const el = document.getElementById("mensaje");
  el.textContent = texto;
  el.className = tipo;
}
