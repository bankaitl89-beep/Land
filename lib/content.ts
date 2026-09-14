export type Lang = "en" | "es" | "ru";

export const content = {
  en: {
    label: "English",
    nav: {
      method: "Method",
      curriculum: "Curriculum",
      platform: "Platform",
      pricing: "Pricing",
      cta: "Get access",
    },
    hero: {
      pill: "Next cohort is open · 500+ graduates",
      title: ["Your job is safe.", "Your ", "workflow", " is not."],
      sub: "Most people tried ChatGPT once, got a wall of generic text, and quietly went back to doing it by hand. This is the part nobody taught you — turning a chat window into a system that runs your actual work.",
      cta: "Get access",
      ghost: "See how it works",
      was: "$299",
      now: "$150",
      tags: ["ChatGPT", "Claude", "Gemini", "Custom assistants", "No code required"],
      app: {
        heading: "Your progress",
        week: "Week 2 of 4 · 62%",
        rows: [
          { state: "done", title: "Prompt architecture", meta: "Homework graded · passed", time: "18 min" },
          { state: "now", title: "Build your first custom assistant", meta: "In progress · check unlocked", time: "24 min" },
          { state: "next", title: "Automate your weekly report", meta: "Unlocks after review", time: "31 min" },
        ],
      },
    },
    pain: {
      eyebrow: "The honest part",
      title: "If any of this sounds familiar, this program was built for you.",
      items: [
        {
          q: "You've watched dozens of AI videos and still open a blank chat not knowing what to type.",
          a: "Tutorials show you features. Almost nobody shows you a workflow — the sequence that takes a real task from start to finished.",
        },
        {
          q: "You tried it. It gave you vague, generic text you'd be embarrassed to send.",
          a: "The model wasn't the problem. The instruction was. Precision is a skill, and it is the one thing this program drills hardest.",
        },
        {
          q: "Your week disappears into reports, summaries, emails and meeting notes.",
          a: "A large share of that work is mechanical. The tools to hand it off have existed for two years — what's missing is the method.",
        },
        {
          q: "Someone in your field does in an hour what still takes you a day.",
          a: "They are not smarter than you. They have a system. A system can be taught, and that is exactly what happens here.",
        },
      ],
    },
    method: {
      eyebrow: "Why this is not another video library",
      title: "You don't buy access. You get taught.",
      lede: "Most AI courses hand you a folder of recordings and wish you luck. Nobody checks whether you understood anything, and three weeks later you're still on lesson two. We built the opposite, and it is the single reason our graduates finish with working processes instead of good intentions.",
      steps: [
        {
          n: "01",
          title: "Lesson",
          text: "Short and applied, built around one real task. No theory dumps, no forty-minute intros.",
        },
        {
          n: "02",
          title: "Comprehension check",
          text: "Questions after every lesson. You can't move forward by scrolling past something you didn't understand.",
        },
        {
          n: "03",
          title: "Homework on your own work",
          text: "You apply it to your actual job — your reports, your clients, your inbox — not a sandbox example.",
        },
        {
          n: "04",
          title: "Review and correction",
          text: "Your work gets read and corrected by a person. This is the step that turns watching into knowing.",
        },
      ],
      note: "Which also means this isn't for someone looking for a folder of videos to feel productive about. It is four weeks of real work, and you will be asked to do it.",
    },
    platform: {
      eyebrow: "The platform",
      title: "Everything runs in one place.",
      sub: "Lessons, checks, homework, feedback and progress live inside our own learning platform. You always know exactly where you are, what's left, and what unlocks next.",
      bullets: [
        "Structured path — the next lesson opens when the previous one is actually done",
        "Every submission is reviewed, nothing disappears into a chat thread",
        "Your prompt and workflow library builds up as you go and stays yours",
        "Works on a laptop or a phone, in whatever hours you actually have",
      ],
    },
    curriculum: {
      eyebrow: "Curriculum",
      title: "What you actually learn",
      sub: "Six modules. Each one ends with something working, not with a certificate of attendance.",
      modules: [
        {
          n: "01",
          title: "Foundations without the jargon",
          text: "How large language models really work, what they can and cannot do, and why the same question gets brilliant answers from one person and garbage from another.",
          result: "You stop guessing and start knowing why an answer came out the way it did.",
        },
        {
          n: "02",
          title: "Prompting that produces usable work",
          text: "Prompt structure for business tasks, advanced techniques, and synthetic personas for pressure-testing ideas before you take them to a real room.",
          result: "First-try output you can send, instead of a tenth attempt you rewrite by hand.",
        },
        {
          n: "03",
          title: "Text, documents and multimodal data",
          text: "Working with long documents, spreadsheets, images and mixed data. Analysis, extraction, summaries and reports that hold up to scrutiny.",
          result: "A 60-page document becomes a decision-ready brief in minutes.",
        },
        {
          n: "04",
          title: "Your own AI assistants",
          text: "Custom assistants for your recurring tasks, plus memory, context control and voice input — the settings that quietly decide whether AI is useful or annoying.",
          result: "Assistants that already know your context, so you stop re-explaining yourself.",
        },
        {
          n: "05",
          title: "Automating the working week",
          text: "Research, reporting, data analysis and meetings. Designing AI processes and scenarios that run the repetitive parts of your week end to end.",
          result: "The recurring work of your week handled by a process you designed.",
        },
        {
          n: "06",
          title: "Building your own tools",
          text: "Creating your own AI tools and small applications without programming, and embedding them into everyday business processes with an AI-first way of thinking.",
          result: "You leave able to build the thing you need instead of waiting for someone to build it.",
        },
      ],
    },
    audience: {
      eyebrow: "Who it's for",
      title: "Built for people who don't write code",
      sub: "No technical background required — and nothing here is dumbed down either.",
      cards: [
        {
          title: "Specialists and managers",
          text: "Marketers, analysts, HR, operations, project managers. You want to be the person in the team whose output changed noticeably.",
        },
        {
          title: "Founders and business owners",
          text: "You want more done without more headcount, and you want to see exactly where AI pays for itself in your company.",
        },
        {
          title: "Team leads and executives",
          text: "You need to bring AI into a department in a way that survives contact with reality — and be able to explain it upward.",
        },
        {
          title: "Freelancers and consultants",
          text: "Your income depends on throughput. Speed and quality here translate directly into more clients and a higher rate.",
        },
      ],
    },
    outcomes: {
      eyebrow: "The outcome",
      title: "What you leave with",
      items: [
        "A set of AI workflows built around your own job — not generic templates from a PDF.",
        "Prompts that produce usable work on the first attempt, consistently.",
        "Your own assistants handling the tasks you used to do by hand every week.",
        "Tools and small applications you built yourself, without writing a line of code.",
        "The habit of reaching for AI first — the part that keeps compounding long after week four.",
      ],
      stats: [
        { v: "500+", l: "Graduates" },
        { v: "2–4", l: "Weeks" },
        { v: "100%", l: "Homework reviewed" },
        { v: "0", l: "Lines of code" },
      ],
    },
    faq: {
      eyebrow: "Before you ask",
      title: "The questions everyone asks first",
      items: [
        {
          q: "I'm not technical at all. Will I keep up?",
          a: "Yes — that is who the program was designed for. There is no programming anywhere in it. If you can use a browser and a document editor, you have everything you need.",
        },
        {
          q: "I don't have time for a course right now.",
          a: "Lessons are short and the whole program runs 2–4 weeks at your own pace. Most people spend less time on it per week than they currently lose to the tasks it removes.",
        },
        {
          q: "Do I need a paid AI subscription?",
          a: "You can start on free accounts. A few of the more advanced lessons are easier on a paid plan, and we tell you exactly which ones and whether it's worth it for your situation — before you spend anything.",
        },
        {
          q: "I already use ChatGPT every day. Is this too basic?",
          a: "Daily users usually gain the most here, because they arrive with real tasks and discover how much of what they do manually could already be running without them.",
        },
        {
          q: "What happens after I send the form?",
          a: "Our manager contacts you by email with start dates, how the platform works, and how to join. No automated funnel, no spam.",
        },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "One program. One price.",
      sub: "No tiers, no upsells, no locked bonus modules. Everyone gets the full program and the same review of their work.",
      was: "$299",
      now: "$150",
      includes: [
        "All six modules on the learning platform",
        "Comprehension checks after every lesson",
        "Homework based on your own real tasks",
        "Personal review and correction of your work",
        "Your prompt and workflow library, yours to keep",
      ],
      cta: "Request access",
    },
    form: {
      title: "Request access",
      sub: "Leave your name and email. Our manager will get in touch with the start details and how to join.",
      name: "Your name",
      namePh: "Maria Gonzalez",
      email: "Email",
      emailPh: "you@company.com",
      submit: "Send request",
      sending: "Sending…",
      success: "Thank you — we'll be in touch shortly.",
      successSub: "Our manager will email you with the next steps.",
      errName: "Please enter your name.",
      errEmail: "Please enter a valid email address.",
      errSend: "Something went wrong. Please try again, or write to us directly.",
      privacy: "We use your details only to contact you about the program.",
    },
    footer: {
      tagline: "Prompt, or perish.",
      rights: "All rights reserved.",
    },
  },

  es: {
    label: "Español",
    nav: {
      method: "Método",
      curriculum: "Programa",
      platform: "Plataforma",
      pricing: "Precio",
      cta: "Obtener acceso",
    },
    hero: {
      pill: "Grupo abierto · más de 500 graduados",
      title: ["Tu puesto está a salvo.", "Tu ", "forma de trabajar", " no."],
      sub: "Casi todos probaron ChatGPT una vez, recibieron un muro de texto genérico y volvieron en silencio a hacerlo a mano. Esta es la parte que nadie te enseñó: convertir una ventana de chat en un sistema que sostiene tu trabajo real.",
      cta: "Obtener acceso",
      ghost: "Ver cómo funciona",
      was: "$299",
      now: "$150",
      tags: ["ChatGPT", "Claude", "Gemini", "Asistentes propios", "Sin programar"],
      app: {
        heading: "Tu progreso",
        week: "Semana 2 de 4 · 62%",
        rows: [
          { state: "done", title: "Arquitectura de prompts", meta: "Tarea corregida · aprobada", time: "18 min" },
          { state: "now", title: "Crea tu primer asistente", meta: "En curso · control desbloqueado", time: "24 min" },
          { state: "next", title: "Automatiza tu informe semanal", meta: "Se abre tras la corrección", time: "31 min" },
        ],
      },
    },
    pain: {
      eyebrow: "Hablemos claro",
      title: "Si algo de esto te suena, el programa se hizo para ti.",
      items: [
        {
          q: "Has visto decenas de vídeos sobre IA y sigues abriendo un chat en blanco sin saber qué escribir.",
          a: "Los tutoriales te enseñan funciones. Casi nadie te enseña un flujo de trabajo: la secuencia que lleva una tarea real de principio a fin.",
        },
        {
          q: "Lo probaste y te devolvió un texto vago y genérico que te daría vergüenza enviar.",
          a: "El problema no era el modelo, era la instrucción. La precisión es una habilidad, y es justo la que más se entrena aquí.",
        },
        {
          q: "Tu semana se va en informes, resúmenes, correos y actas de reuniones.",
          a: "Buena parte de ese trabajo es mecánico. Las herramientas para delegarlo existen desde hace dos años; lo que falta es el método.",
        },
        {
          q: "Alguien de tu sector hace en una hora lo que a ti todavía te lleva un día.",
          a: "No es más inteligente que tú. Tiene un sistema. Un sistema se puede enseñar, y eso es exactamente lo que pasa aquí.",
        },
      ],
    },
    method: {
      eyebrow: "Por qué esto no es otra videoteca",
      title: "No compras acceso. Aquí te enseñan.",
      lede: "La mayoría de los cursos de IA te entregan una carpeta de grabaciones y te desean suerte. Nadie comprueba si entendiste algo y tres semanas después sigues en la lección dos. Nosotros hicimos lo contrario, y es la única razón por la que nuestros graduados terminan con procesos que funcionan en vez de buenas intenciones.",
      steps: [
        {
          n: "01",
          title: "Lección",
          text: "Breve y aplicada, construida sobre una tarea real. Sin teoría de relleno ni introducciones de cuarenta minutos.",
        },
        {
          n: "02",
          title: "Control de comprensión",
          text: "Preguntas después de cada lección. No se avanza pasando por encima de algo que no entendiste.",
        },
        {
          n: "03",
          title: "Tarea sobre tu propio trabajo",
          text: "Lo aplicas a tu puesto real: tus informes, tus clientes, tu bandeja de entrada. No a un ejemplo de laboratorio.",
        },
        {
          n: "04",
          title: "Corrección personal",
          text: "Una persona lee y corrige lo que entregaste. Este es el paso que convierte mirar en saber.",
        },
      ],
      note: "Esto también significa que no es para quien busca una carpeta de vídeos con la que sentirse productivo. Son cuatro semanas de trabajo real, y se te va a pedir que lo hagas.",
    },
    platform: {
      eyebrow: "La plataforma",
      title: "Todo ocurre en un solo lugar.",
      sub: "Lecciones, controles, tareas, correcciones y progreso viven dentro de nuestra propia plataforma. Siempre sabes exactamente dónde estás, qué te queda y qué se desbloquea después.",
      bullets: [
        "Ruta estructurada: la siguiente lección se abre cuando la anterior está realmente hecha",
        "Cada entrega se revisa; nada se pierde en un hilo de chat",
        "Tu biblioteca de prompts y flujos crece contigo y se queda contigo",
        "Funciona en portátil o móvil, en las horas que realmente tengas",
      ],
    },
    curriculum: {
      eyebrow: "Programa",
      title: "Lo que aprendes de verdad",
      sub: "Seis módulos. Cada uno termina con algo que funciona, no con un diploma de asistencia.",
      modules: [
        {
          n: "01",
          title: "Fundamentos sin jerga",
          text: "Cómo funcionan realmente los modelos de lenguaje, qué pueden y qué no pueden hacer, y por qué la misma pregunta da respuestas brillantes a una persona y basura a otra.",
          result: "Dejas de adivinar y entiendes por qué una respuesta salió así.",
        },
        {
          n: "02",
          title: "Prompts que producen trabajo utilizable",
          text: "Estructura de prompts para tareas de negocio, técnicas avanzadas y personajes sintéticos para poner a prueba tus ideas antes de llevarlas a una sala real.",
          result: "Resultados enviables al primer intento, no al décimo.",
        },
        {
          n: "03",
          title: "Texto, documentos y datos multimodales",
          text: "Trabajo con documentos largos, hojas de cálculo, imágenes y datos mixtos. Análisis, extracción, resúmenes e informes que aguantan el escrutinio.",
          result: "Un documento de 60 páginas se convierte en un informe accionable en minutos.",
        },
        {
          n: "04",
          title: "Tus propios asistentes de IA",
          text: "Asistentes a medida para tus tareas recurrentes, además de memoria, control del contexto y entrada por voz: los ajustes que deciden en silencio si la IA es útil o molesta.",
          result: "Asistentes que ya conocen tu contexto, así dejas de explicarte una y otra vez.",
        },
        {
          n: "05",
          title: "Automatizar la semana laboral",
          text: "Investigación, informes, análisis de datos y reuniones. Diseño de procesos y escenarios de IA que se encargan de la parte repetitiva de tu semana de principio a fin.",
          result: "El trabajo recurrente de tu semana lo lleva un proceso que diseñaste tú.",
        },
        {
          n: "06",
          title: "Crear tus propias herramientas",
          text: "Construir tus propias herramientas y pequeñas aplicaciones de IA sin programar, e integrarlas en los procesos del día a día con una mentalidad AI-first.",
          result: "Sales pudiendo construir lo que necesitas en vez de esperar a que alguien lo haga.",
        },
      ],
    },
    audience: {
      eyebrow: "Para quién es",
      title: "Hecho para gente que no programa",
      sub: "No hace falta formación técnica, y tampoco hay nada simplificado de más.",
      cards: [
        {
          title: "Especialistas y mandos intermedios",
          text: "Marketing, análisis, RR. HH., operaciones, gestión de proyectos. Quieres ser la persona del equipo cuyo rendimiento cambió de forma visible.",
        },
        {
          title: "Fundadores y dueños de negocio",
          text: "Quieres hacer más sin ampliar plantilla, y ver exactamente dónde la IA se paga sola dentro de tu empresa.",
        },
        {
          title: "Responsables de equipo y directivos",
          text: "Necesitas meter la IA en un departamento de forma que sobreviva al contacto con la realidad, y poder explicarlo hacia arriba.",
        },
        {
          title: "Freelancers y consultores",
          text: "Tus ingresos dependen de tu capacidad de entrega. Aquí la velocidad y la calidad se traducen en más clientes y mejor tarifa.",
        },
      ],
    },
    outcomes: {
      eyebrow: "El resultado",
      title: "Con qué te vas",
      items: [
        "Un conjunto de flujos de IA construidos sobre tu propio trabajo, no plantillas genéricas de un PDF.",
        "Prompts que producen trabajo utilizable al primer intento, de forma consistente.",
        "Tus propios asistentes ocupándose de lo que antes hacías a mano cada semana.",
        "Herramientas y pequeñas aplicaciones creadas por ti, sin escribir una línea de código.",
        "El hábito de acudir primero a la IA, que es lo que sigue dando frutos mucho después de la cuarta semana.",
      ],
      stats: [
        { v: "500+", l: "Graduados" },
        { v: "2–4", l: "Semanas" },
        { v: "100%", l: "Tareas corregidas" },
        { v: "0", l: "Líneas de código" },
      ],
    },
    faq: {
      eyebrow: "Antes de preguntar",
      title: "Lo que todo el mundo pregunta primero",
      items: [
        {
          q: "No tengo perfil técnico. ¿Podré seguirlo?",
          a: "Sí, el programa se diseñó precisamente para eso. No hay programación en ninguna parte. Si sabes usar un navegador y un editor de texto, tienes todo lo necesario.",
        },
        {
          q: "Ahora mismo no tengo tiempo para un curso.",
          a: "Las lecciones son cortas y el programa dura de 2 a 4 semanas a tu ritmo. La mayoría dedica menos tiempo del que ya pierde en las tareas que este programa elimina.",
        },
        {
          q: "¿Necesito una suscripción de pago a la IA?",
          a: "Puedes empezar con cuentas gratuitas. Algunas lecciones avanzadas son más cómodas con un plan de pago, y te decimos exactamente cuáles y si te compensa en tu caso, antes de que gastes nada.",
        },
        {
          q: "Ya uso ChatGPT a diario. ¿Se me quedará corto?",
          a: "Quien lo usa a diario suele ser el que más gana aquí, porque llega con tareas reales y descubre cuánto de lo que hace a mano ya podría funcionar sin él.",
        },
        {
          q: "¿Qué pasa después de enviar el formulario?",
          a: "Nuestro responsable te escribe por correo con las fechas de inicio, cómo funciona la plataforma y cómo entrar. Sin embudos automáticos ni spam.",
        },
      ],
    },
    pricing: {
      eyebrow: "Precio",
      title: "Un programa. Un precio.",
      sub: "Sin niveles, sin ventas adicionales, sin módulos bonus bloqueados. Todos reciben el programa completo y la misma corrección de su trabajo.",
      was: "$299",
      now: "$150",
      includes: [
        "Los seis módulos en la plataforma de aprendizaje",
        "Controles de comprensión tras cada lección",
        "Tareas basadas en tus propios casos reales",
        "Corrección personal de tu trabajo",
        "Tu biblioteca de prompts y flujos, para quedártela",
      ],
      cta: "Solicitar acceso",
    },
    form: {
      title: "Solicitar acceso",
      sub: "Déjanos tu nombre y tu correo. Nuestro responsable se pondrá en contacto contigo con las fechas de inicio y los pasos para entrar.",
      name: "Tu nombre",
      namePh: "María González",
      email: "Correo electrónico",
      emailPh: "tu@empresa.com",
      submit: "Enviar solicitud",
      sending: "Enviando…",
      success: "Gracias, nos pondremos en contacto contigo en breve.",
      successSub: "Nuestro responsable te escribirá con los siguientes pasos.",
      errName: "Introduce tu nombre, por favor.",
      errEmail: "Introduce un correo electrónico válido.",
      errSend: "Algo ha fallado. Inténtalo de nuevo o escríbenos directamente.",
      privacy: "Usamos tus datos únicamente para contactarte sobre el programa.",
    },
    footer: {
      tagline: "Promptea o perece.",
      rights: "Todos los derechos reservados.",
    },
  },
  ru: {
    label: "Русский",
    nav: {
      method: "Метод",
      curriculum: "Программа",
      platform: "Платформа",
      pricing: "Стоимость",
      cta: "Получить доступ",
    },
    hero: {
      pill: "Набор открыт · более 500 выпускников",
      title: ["Ваша работа в безопасности.", "Ваши ", "рабочие процессы", " — нет."],
      sub: "Большинство один раз попробовали ChatGPT, получили стену общих фраз и молча вернулись к ручной работе. Это та часть, которой вас никто не учил: превратить окно чата в систему, которая реально везёт вашу работу.",
      cta: "Получить доступ",
      ghost: "Как это устроено",
      was: "$299",
      now: "$150",
      tags: ["ChatGPT", "Claude", "Gemini", "Свои ассистенты", "Без программирования"],
      app: {
        heading: "Ваш прогресс",
        week: "Неделя 2 из 4 · 62%",
        rows: [
          { state: "done", title: "Архитектура промпта", meta: "Домашняя работа проверена · зачёт", time: "18 мин" },
          { state: "now", title: "Собираем первого ассистента", meta: "В работе · тест открыт", time: "24 мин" },
          { state: "next", title: "Автоматизируем еженедельный отчёт", meta: "Откроется после проверки", time: "31 мин" },
        ],
      },
    },
    pain: {
      eyebrow: "Без прикрас",
      title: "Если что-то из этого про вас — программа сделана именно для вас.",
      items: [
        {
          q: "Вы посмотрели десятки видео про ИИ и всё равно открываете пустой чат, не понимая, что писать.",
          a: "Обзоры показывают функции. Почти никто не показывает рабочий процесс — последовательность, которая доводит реальную задачу до готового результата.",
        },
        {
          q: "Вы попробовали, а в ответ получили размытый общий текст, который стыдно отправить.",
          a: "Дело было не в модели, а в постановке задачи. Точность формулировки — это навык, и именно его здесь тренируют жёстче всего.",
        },
        {
          q: "Неделя уходит на отчёты, сводки, письма и протоколы встреч.",
          a: "Большая часть этой работы механическая. Инструменты, чтобы её отдать, существуют уже два года — не хватает метода.",
        },
        {
          q: "Кто-то в вашей сфере делает за час то, на что у вас всё ещё уходит день.",
          a: "Он не умнее вас. У него есть система. Систему можно передать — именно это здесь и происходит.",
        },
      ],
    },
    method: {
      eyebrow: "Почему это не очередная видеотека",
      title: "Вы покупаете не доступ. Вас здесь учат.",
      lede: "Большинство курсов по ИИ выдают папку с записями и желают удачи. Никто не проверяет, поняли ли вы хоть что-то, и через три недели вы всё ещё на втором уроке. Мы сделали ровно наоборот — и только поэтому наши выпускники заканчивают с работающими процессами, а не с хорошими намерениями.",
      steps: [
        {
          n: "01",
          title: "Урок",
          text: "Короткий и прикладной, построен вокруг одной реальной задачи. Без теории ради теории и получасовых вступлений.",
        },
        {
          n: "02",
          title: "Проверка усвоения",
          text: "Вопросы после каждого урока. Пролистать непонятое и пойти дальше не получится.",
        },
        {
          n: "03",
          title: "Домашняя работа на вашем материале",
          text: "Вы применяете это к своей настоящей работе — своим отчётам, клиентам, почте, а не к учебному примеру.",
        },
        {
          n: "04",
          title: "Проверка и разбор",
          text: "Вашу работу читает и правит человек. Именно этот шаг превращает просмотр в умение.",
        },
      ],
      note: "Это же значит, что курс не для тех, кто ищет папку с видео, чтобы почувствовать себя продуктивным. Это четыре недели настоящей работы, и делать её придётся вам.",
    },
    platform: {
      eyebrow: "Платформа",
      title: "Всё происходит в одном месте.",
      sub: "Уроки, проверки, домашние задания, обратная связь и прогресс живут внутри нашей собственной платформы. Вы всегда точно знаете, где находитесь, что осталось и что откроется дальше.",
      bullets: [
        "Выстроенный путь — следующий урок открывается, когда предыдущий действительно сделан",
        "Каждая работа проверяется, ничего не теряется в переписке",
        "Ваша библиотека промптов и процессов растёт по ходу и остаётся с вами",
        "Работает с ноутбука и с телефона, в те часы, которые у вас реально есть",
      ],
    },
    curriculum: {
      eyebrow: "Программа",
      title: "Чему вы научитесь на самом деле",
      sub: "Шесть модулей. Каждый заканчивается работающим результатом, а не сертификатом о посещении.",
      modules: [
        {
          n: "01",
          title: "Основы без жаргона",
          text: "Как на самом деле работают большие языковые модели, что они могут и чего не могут, и почему один и тот же вопрос одному человеку даёт блестящий ответ, а другому — мусор.",
          result: "Вы перестаёте угадывать и начинаете понимать, почему ответ получился таким.",
        },
        {
          n: "02",
          title: "Промпты, дающие рабочий результат",
          text: "Структура промпта под бизнес-задачи, продвинутые техники и синтетические персонажи, чтобы проверить идею на прочность до того, как выносить её людям.",
          result: "Результат, который можно отправить с первой попытки, а не с десятой.",
        },
        {
          n: "03",
          title: "Текст, документы и мультимодальные данные",
          text: "Работа с длинными документами, таблицами, изображениями и смешанными данными. Анализ, извлечение фактов, сводки и отчёты, которые выдерживают проверку.",
          result: "Документ на 60 страниц превращается в готовую к решению справку за минуты.",
        },
        {
          n: "04",
          title: "Собственные ИИ-ассистенты",
          text: "Ассистенты под ваши повторяющиеся задачи, а также память, управление контекстом и голосовой ввод — настройки, которые тихо решают, полезен ИИ или раздражает.",
          result: "Ассистенты, которые уже знают ваш контекст, — перестаёте объяснять одно и то же.",
        },
        {
          n: "05",
          title: "Автоматизация рабочей недели",
          text: "Исследования, отчётность, анализ данных и встречи. Проектирование ИИ-процессов и сценариев, которые ведут повторяющуюся часть недели от начала до конца.",
          result: "Рутина недели закрывается процессом, который спроектировали вы.",
        },
        {
          n: "06",
          title: "Свои инструменты и приложения",
          text: "Создание собственных ИИ-инструментов и небольших приложений без программирования и встраивание их в повседневные процессы с мышлением AI-first.",
          result: "Вы уходите с умением собрать нужное самому, а не ждать, пока соберёт кто-то.",
        },
      ],
    },
    audience: {
      eyebrow: "Для кого",
      title: "Для тех, кто не пишет код",
      sub: "Техническое образование не нужно — и ничего здесь не упрощено до детского уровня.",
      cards: [
        {
          title: "Специалисты и менеджеры",
          text: "Маркетинг, аналитика, HR, операционка, управление проектами. Вы хотите стать тем, чей результат в команде заметно изменился.",
        },
        {
          title: "Предприниматели и владельцы бизнеса",
          text: "Вы хотите делать больше без расширения штата и видеть, где именно ИИ окупает себя в вашей компании.",
        },
        {
          title: "Руководители и тимлиды",
          text: "Вам нужно внедрить ИИ в отдел так, чтобы это пережило столкновение с реальностью, и уметь объяснить это наверх.",
        },
        {
          title: "Фрилансеры и консультанты",
          text: "Ваш доход зависит от пропускной способности. Скорость и качество здесь прямо конвертируются в больше клиентов и выше чек.",
        },
      ],
    },
    outcomes: {
      eyebrow: "Результат",
      title: "С чем вы уходите",
      items: [
        "Набор ИИ-процессов, собранных под вашу собственную работу, а не шаблоны из PDF.",
        "Промпты, которые стабильно дают пригодный результат с первой попытки.",
        "Собственные ассистенты, закрывающие то, что вы каждую неделю делали руками.",
        "Инструменты и небольшие приложения, собранные вами без единой строчки кода.",
        "Привычка идти к ИИ первым делом — то, что продолжает работать долго после четвёртой недели.",
      ],
      stats: [
        { v: "500+", l: "Выпускников" },
        { v: "2–4", l: "Недели" },
        { v: "100%", l: "Работ проверено" },
        { v: "0", l: "Строчек кода" },
      ],
    },
    faq: {
      eyebrow: "Частые вопросы",
      title: "О чём спрашивают в первую очередь",
      items: [
        {
          q: "Я совсем не технарь. Справлюсь?",
          a: "Да, программа делалась именно под это. Программирования здесь нет нигде. Если вы умеете пользоваться браузером и текстовым редактором, у вас есть всё необходимое.",
        },
        {
          q: "У меня сейчас нет времени на курс.",
          a: "Уроки короткие, вся программа занимает 2–4 недели в вашем темпе. Большинство тратит на неё в неделю меньше, чем уже теряет на задачах, которые она убирает.",
        },
        {
          q: "Нужна ли платная подписка на ИИ?",
          a: "Начать можно на бесплатных аккаунтах. Несколько продвинутых уроков удобнее проходить на платном тарифе — мы честно говорим, каких именно и стоит ли оно того в вашем случае, до того как вы что-то потратите.",
        },
        {
          q: "Я и так пользуюсь ChatGPT каждый день. Не будет ли слишком просто?",
          a: "Как раз ежедневные пользователи обычно выигрывают больше всех: они приходят с реальными задачами и обнаруживают, сколько из того, что делается руками, могло бы уже работать без них.",
        },
        {
          q: "Что будет после отправки формы?",
          a: "Наш менеджер свяжется с вами по почте: расскажет о датах старта, как устроена платформа и как попасть на обучение. Без автоворонок и спама.",
        },
      ],
    },
    pricing: {
      eyebrow: "Стоимость",
      title: "Одна программа. Одна цена.",
      sub: "Без тарифов, доплат и закрытых бонусных модулей. Все получают полную программу и одинаковую проверку своих работ.",
      was: "$299",
      now: "$150",
      includes: [
        "Все шесть модулей на учебной платформе",
        "Проверка усвоения после каждого урока",
        "Домашние задания на ваших реальных задачах",
        "Личная проверка и разбор ваших работ",
        "Ваша библиотека промптов и процессов — остаётся у вас",
      ],
      cta: "Оставить заявку",
    },
    form: {
      title: "Оставить заявку",
      sub: "Оставьте имя и почту. Наш менеджер свяжется с вами, расскажет о датах старта и как попасть на обучение.",
      name: "Ваше имя",
      namePh: "Мария Иванова",
      email: "Почта",
      emailPh: "you@company.com",
      submit: "Отправить заявку",
      sending: "Отправляем…",
      success: "Спасибо, мы свяжемся с вами в ближайшее время.",
      successSub: "Менеджер напишет вам на почту и расскажет, что дальше.",
      errName: "Пожалуйста, укажите имя.",
      errEmail: "Укажите корректный адрес почты.",
      errSend: "Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.",
      privacy: "Мы используем ваши данные только чтобы связаться с вами по поводу обучения.",
    },
    footer: {
      tagline: "Промпти или погибни.",
      rights: "Все права защищены.",
    },
  },
};

export type Copy = (typeof content)["en"];
