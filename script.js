/* js/script.js
   Lógica del chatbot NOVA para chatbot.html
   - Local (sin APIs)
   - Reconoce preguntas clave y responde
   - Maneja botones de "Preguntas sugeridas"
   - Inserta mensajes en el área de chat con indicador de escritura
*/

document.addEventListener('DOMContentLoaded', function () {
  const chatArea = document.getElementById('chatArea');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const suggestedBtns = document.querySelectorAll('.suggested');
  const anioFooter = document.getElementById('anioFooterChat');

  // Respuestas definidas para las preguntas solicitadas
  const RESPONSES = {
    tusi: "El término 'tusi' se usa en algunos contextos para referirse a mezclas o píldoras sintéticas que pueden contener diferentes sustancias. Su composición suele ser incierta y a menudo incluyen compuestos peligrosos o adulterantes. El consumo conlleva riesgos significativos para la salud.",
    mdma: "El MDMA (conocido también como éxtasis) es una droga sintética que puede producir euforia, sensación de cercanía emocional y aumento de energía. Entre sus riesgos están la deshidratación, hipertermia, alteraciones cardíacas, ansiedad y, en consumo prolongado o en dosis altas, daño neurológico.",
    riesgos: "Los riesgos del consumo de drogas sintéticas incluyen: reacciones adversas impredecibles por adulterantes, sobredosis, problemas cardiovasculares, daño neurológico, dependencia, problemas psicológicos y riesgo de muerte. Mezclar sustancias aumenta mucho el peligro.",
    ayudar: "Para ayudar a un amigo: mantén la calma, habla sin juzgar, busca un lugar seguro, evita dejarlo solo si está desorientado, llama a servicios de emergencia si hay signos de intoxicación grave y acompáñalo a profesionales de salud o centros de apoyo. Ofrece apoyo y orientación para buscar ayuda especializada.",
    peru: "En Perú puedes buscar ayuda en centros de salud locales, servicios de emergencia (línea 113) y organizaciones sociales que trabajan prevención y tratamiento. También existen programas regionales de salud mental y consumo. Si me indicas tu región, puedo sugerir tipos de instituciones a contactar (hospitales, centros de salud mental, líneas locales).",
    prevenir: "Para prevenir el consumo: informar con evidencia, fortalecer habilidades de toma de decisiones, promover redes de apoyo, actividades alternativas, acceso a recursos educativos y servicios de salud, y campañas de reducción de riesgos. Mantener conversaciones abiertas y sin estigmas ayuda a la prevención."
  };

  // Mensaje fallback
  const FALLBACK = "No tengo información sobre esa consulta. Intenta formular otra pregunta relacionada con prevención y salud.";

  // Escape HTML to avoid inyección
  function escapeHtml(unsafe) {
    return String(unsafe)
      .replaceAll('&', "&amp;")
      .replaceAll('<', "&lt;")
      .replaceAll('>', "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Añade un mensaje al chat
  function appendMessage(sender, text) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('d-flex', 'mb-3');
    const safeText = escapeHtml(text);

    if (sender === 'nova') {
      wrapper.classList.add('align-items-start');
      wrapper.innerHTML = `
        <div class="me-2">
          <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style="width:44px;height:44px;">
            <span class="fw-bold text-light small">N</span>
          </div>
        </div>
        <div class="flex-grow-1">
          <div class="card" style="background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.03);">
            <div class="card-body py-2 px-3">
              <div class="small text-white">${safeText}</div>
            </div>
          </div>
        </div>
      `;
    } else {
      wrapper.classList.add('justify-content-end', 'align-items-end');
      wrapper.innerHTML = `
        <div class="flex-shrink-0 me-2 text-end" style="max-width:78%;">
          <div class="card text-end" style="background: linear-gradient(90deg, rgba(0,208,132,0.08), rgba(0,208,132,0.04)); border:1px solid rgba(0,208,132,0.10);">
            <div class="card-body py-2 px-3">
              <div class="small text-white">${safeText}</div>
            </div>
          </div>
        </div>
      `;
    }

    chatArea.appendChild(wrapper);
    scrollToBottom();
  }

  // Indicador de escritura
  function showTypingIndicator() {
    const typ = document.createElement('div');
    typ.className = 'd-flex mb-3 align-items-start';
    typ.id = 'typingIndicator';
    typ.innerHTML = `
      <div class="me-2">
        <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style="width:44px;height:44px;">
          <span class="fw-bold text-light small">N</span>
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="card" style="background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.02);">
          <div class="card-body py-2 px-3">
            <div class="small text-muted">NOVA está escribiendo<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
          </div>
        </div>
      </div>
    `;
    chatArea.appendChild(typ);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typ = document.getElementById('typingIndicator');
    if (typ) typ.remove();
  }

  function scrollToBottom() {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
  }

  // Normaliza texto para comparar (minusculas, quita acentos basicos)
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
      .replace(/[?¡!.,]/g, '')
      .trim();
  }

  // Determina la respuesta según la pregunta (palabras clave + coincidencias)
  function determineResponse(question) {
    const q = normalize(question);

    // comprobaciones por coincidencia directa o por palabras clave
    if (q === 'qué es el tusi' || q.includes('tusi')) return RESPONSES.tusi;
    if (q === 'qué es el mdma' || q.includes('mdma') || q.includes('mdma (') || q.includes('mdma')) return RESPONSES.mdma;
    if (q === 'cuáles son los riesgos' || q.includes('riesg') || q.includes('riesgo')) return RESPONSES.riesgos;
    if (q === 'cómo ayudar a un amigo' || q.includes('ayud') || q.includes('amig')) return RESPONSES.ayudar;
    if (q === 'dónde buscar ayuda en peru' || q.includes('peru') || q.includes('perú') || q.includes('buscar ayuda')) return RESPONSES.peru;
    if (q === 'cómo prevenir el consumo' || q.includes('prevenir') || q.includes('prevencion') || q.includes('prevención')) return RESPONSES.prevenir;

    return null;
  }

  // Procesa el envío: muestra mensaje usuario + respuesta de NOVA (con delay)
  function processQuestion(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    appendMessage('user', trimmed);
    userInput.value = '';
    // Simula "escribiendo"
    showTypingIndicator();
    const delay = 600 + Math.floor(Math.random() * 800);
    setTimeout(() => {
      removeTypingIndicator();
      const resp = determineResponse(trimmed);
      if (resp) appendMessage('nova', resp);
      else appendMessage('nova', FALLBACK);
    }, delay);
  }

  // Eventos
  sendBtn.addEventListener('click', () => {
    processQuestion(userInput.value);
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Botones de "Preguntas sugeridas": escriben y envían la pregunta automáticamente
  suggestedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-q') || btn.textContent;
      // Opcional: llenar el input primero (permite editar), luego enviar
      userInput.value = q;
      // enviar inmediatamente
      processQuestion(q);
    });
  });

  // Mensaje de bienvenida inicial
  function initialMessage() {
    const welcome = "Hola. Soy NOVA. Estoy aquí para brindarte información confiable sobre prevención del consumo de drogas sintéticas y recursos de ayuda.";
    appendMessage('nova', welcome);
  }

  // Fecha en footer
  if (anioFooter) anioFooter.textContent = new Date().getFullYear();

  // Inicializar chat
  initialMessage();
});