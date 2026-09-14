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
      pill: "500+ graduates · 2–4 weeks · nothing to install",
      title: ["Four weeks from now,", "you'll stop doing by hand ", "what AI can do for you", "."],
      sub: "Not a pile of videos you'll never finish. A lesson, then homework on your own real work, then a person who reads it and shows you what's wrong. You finish with ready-made setups that write your reports, your emails and your document summaries — not a folder of notes.",
      cta: "Get access",
      ghost: "How it works",
      was: "$299",
      now: "$150",
      tags: ["ChatGPT", "Claude", "Gemini", "Your own helpers", "No coding"],
      app: {
        heading: "Your progress",
        week: "Week 2 of 4 · 62%",
        rows: [
          { state: "done", title: "Weekly report now writes itself", meta: "Submitted · reviewed · working", time: "18 min" },
          { state: "now", title: "A helper that knows your clients", meta: "In progress · check unlocked", time: "24 min" },
          { state: "next", title: "Meeting recording into a task list", meta: "Opens after your review", time: "31 min" },
        ],
      },
    },
    pain: {
      eyebrow: "Why you're still doing it by hand",
      title: "You already know AI could do this. That's exactly what makes it worse.",
      items: [
        {
          q: "You've watched dozens of videos and still open a blank chat, type something, and delete it.",
          a: "Videos teach features. Almost nobody walks you through one real task from start to finished, with your own material on the screen.",
        },
        {
          q: "What comes back is polished, generic, and about 20% wrong — so you rewrite it and lose the time twice.",
          a: "That is a briefing problem, not a model problem. The fix is a repeatable structure, and it takes about two hours to learn properly.",
        },
        {
          q: "Every Monday you rebuild the same report, the same summary, the same status update.",
          a: "Work that repeats is work you can hand over once and reuse forever. Most people never make that handover because nobody showed them how.",
        },
        {
          q: "Someone in your field ships in an hour what takes you a day, and you can't see what they do differently.",
          a: "They are not writing better prompts. They stopped prompting and built processes. It is a different activity, and it is learnable in weeks.",
        },
      ],
    },
    mechanism: {
      eyebrow: "The difference",
      title: "You don't memorise tricks. You build yourself setups — one per lesson.",
      lede: "Tricks fade: you remember them on Tuesday and not on Thursday. A setup doesn't fade. It's a description of a job you wrote once and then simply run again — every Monday, for every client, for every contract. You don't have to remember how you made it for it to keep working.",
      pillars: [
        {
          n: "You build",
          title: "One setup per lesson, on your own work",
          text: "Not a practice exercise. Your actual report, your actual client email, your actual contract. You write what you need, in what form, and what to double-check.",
        },
        {
          n: "We check",
          title: "A person finds where it breaks",
          text: "Your teacher reads what you built and shows you where it will let you down in real use. No video can do that.",
        },
        {
          n: "You keep it",
          title: "The setup is yours for good",
          text: "Corrected and working. A month in you have a whole set of them, and they keep working long after you've forgotten how you made them.",
        },
      ],
      close: "That's why our graduates are still using theirs six months later. After an ordinary video course, that almost never happens.",
    },
    demo: {
      eyebrow: "See it",
      title: "The whole difference, in one example",
      lede: "Same model, same task, forty seconds of extra instruction. Pick whichever is closest to your week — the skill underneath is identical, and it's the first thing you get.",
      badLabel: "What most people type",
      goodLabel: "What you'll type by day three",
      resultLabel: "What comes back",
      note: "No secret words, no hacks. Just structure: who's reading, what they care about, what counts as evidence, what shape the answer takes. Structure is a skill — and once you have it, the same move works on any task you bring.",
      tabs: [
        {
          id: "report",
          label: "A report for your boss",
          bad: {
            prompt: "Summarise this quarterly report for my director.",
            result:
              "Eight tidy paragraphs restating what the report already says. No opinion, no numbers pulled forward, nothing your director asked about last time. You rewrite it yourself and wonder why you bothered.",
          },
          good: {
            prompt: [
              "You're briefing my director, who reads for 90 seconds and asks about margin first.",
              "From the attached report give me: three numbers that moved and why,",
              "two risks with the page they're evidenced on, one decision waiting on her.",
              "Anything you can't evidence from the document, list separately as an open question.",
              "One page. No adjectives.",
            ],
            result:
              "A one-page brief opening with margin, every claim tied to a page number, risks kept separate from speculation, and the decision she has to make sitting at the bottom. Sent as-is.",
          },
        },
        {
          id: "client",
          label: "Bad news to a client",
          bad: {
            prompt: "Write an email telling the client the deadline is slipping by two weeks.",
            result:
              "A polite apology with no plan. The client reads it and takes away one thing: you're late and you don't know what to do about it. Then they call your manager.",
          },
          good: {
            prompt: [
              "Client expected delivery on the 14th; it'll be the 28th. Cause: our supplier missed a shipment.",
              "Write the email: first line is the new date and what they get this week regardless.",
              "Then the cause in one sentence, no excuses. Then what we're changing so it doesn't repeat.",
              "End with the one thing I need from them and by when.",
              "Calm and professional. Apologise once, not three times. Eight lines maximum.",
            ],
            result:
              "An email that opens with the fix instead of the apology: new date, what lands this week anyway, the cause in one line, and a single clear question back. They reply with an answer, not a complaint.",
          },
        },
        {
          id: "contract",
          label: "A contract you have to check",
          bad: {
            prompt: "Read this contract and tell me what's wrong with it.",
            result:
              "A general walk-through of the clauses ending in \"consult a lawyer\". Nothing anyone would actually argue over, no clause numbers, no numbers at all. You end up reading it yourself anyway.",
          },
          good: {
            prompt: [
              "Review this contract from my side — I'm the supplier, $12,000, three months.",
              "Find: anything that could make me work or pay beyond what's agreed;",
              "anything letting them terminate without compensation; deadlines that don't depend on me.",
              "For each one: the quote, the clause number, and wording I could propose instead.",
              "If a clause is fine, don't mention it.",
            ],
            result:
              "Six clauses with quotes and numbers: unlimited revisions at no extra cost, same-day termination, acceptance with no deadline. Each with replacement wording you can send. Twenty minutes instead of an evening.",
          },
        },
      ],
    },
    method: {
      eyebrow: "How a lesson runs",
      title: "You're not buying access. You're being taught.",
      lede: "Most AI courses hand you recordings and wish you luck. Nobody checks whether you understood anything, and three weeks later you're still on lesson two with a folder you feel guilty about. Here you can't drift: each step has to close before the next one opens.",
      steps: [
        {
          n: "01",
          title: "Lesson",
          text: "Short, applied, built around one real task. No theory for its own sake, no forty-minute introductions.",
        },
        {
          n: "02",
          title: "Check",
          text: "Questions after every lesson. Scrolling past something you didn't understand doesn't move you forward.",
        },
        {
          n: "03",
          title: "Homework on your own work",
          text: "Your reports, your clients, your inbox. Whatever you build here is something you'll use next Monday, not a sandbox exercise.",
        },
        {
          n: "04",
          title: "Review",
          text: "A person reads what you submitted and corrects it. This is the step that turns watching into knowing.",
        },
      ],
      note: "Which also means it isn't for someone who wants a video library to feel productive about. It's four weeks of real work, and the work is yours to do. If that's not what you're looking for, don't buy it — you'd be wasting your money and our review time.",
    },
    platform: {
      eyebrow: "Where it happens",
      title: "One place, and it keeps you honest.",
      sub: "Lessons, checks, homework, corrections and progress live in our own platform. The next lesson opens when the last one actually closed — which is the difference between finishing a course and owning a folder.",
      bullets: [
        "Your path is sequenced — nothing unlocks because you scrolled past it",
        "Every submission is read and answered, nothing disappears into a chat",
        "Your process library builds up week by week and stays yours afterwards",
        "Laptop or phone, in whatever hours you actually have",
      ],
    },
    curriculum: {
      eyebrow: "Curriculum",
      title: "Six modules, and after each one something works",
      sub: "Each is written as a result, not a topic. If a module doesn't leave you with a working tool, it doesn't belong here.",
      modules: [
        {
          n: "01",
          title: "How this actually works",
          text: "What these systems are, how they differ, and why the same question gives one person a solid answer and another person nonsense. And above all: where AI confidently lies to you.",
          result: "You know what to trust and what to check — and you spot an invented fact in seconds.",
        },
        {
          n: "02",
          title: "How to ask so it works first time",
          text: "What a request that works is made of: who will read it, what counts as a fact, what to leave out, what shape the answer takes. Plus the trick for testing an idea on invented customers before you meet real ones.",
          result: "An answer you send as it is, instead of rewriting it yourself.",
        },
        {
          n: "03",
          title: "Documents, spreadsheets, scans and photos",
          text: "Contracts, reports, invoices, slide decks, photographs of paperwork. Find what matters, compare, calculate, pull out the point, check it clause by clause.",
          result: "A 60-page document becomes one readable page, with a reference for every claim.",
        },
        {
          n: "04",
          title: "A helper that already knows you",
          text: "An assistant set up around you: it remembers your clients, your style and your standards. Plus voice input — dictate on the move, get finished text back.",
          result: "You stop explaining who you are and how you work every single morning.",
        },
        {
          n: "05",
          title: "The routine that runs without you",
          text: "Weekly reports, finding information, going through numbers, meeting recordings. Build it once and it runs on its own; you only approve it.",
          result: "Monday's report takes ten minutes of checking instead of a whole morning.",
        },
        {
          n: "06",
          title: "Your own tools, without coding",
          text: "A small program for your own job — a calculator, a bot, a helper for your staff — built in an evening, without a single line of code.",
          result: "What you'd have waited a quarter for from IT, you make yourself in one evening.",
        },
      ],
    },
    audience: {
      eyebrow: "Who this is for",
      title: "People who don't write code and don't have spare months",
      sub: "No technical background needed. Nothing here is watered down either — you'll be doing real work from the first week.",
      cards: [
        {
          title: "Specialists and managers",
          text: "Marketing, analytics, HR, operations, projects. You want to be the one in the team whose output visibly changed, not the one explaining why it didn't.",
        },
        {
          title: "Founders and owners",
          text: "You want more done without more headcount, and you want to see exactly where AI pays for itself before you roll it out to anyone else.",
        },
        {
          title: "Team leads and executives",
          text: "You need AI in your department in a form that survives contact with reality — and a straight answer when your board asks what changed.",
        },
        {
          title: "Freelancers and consultants",
          text: "Your income is capped by throughput. Every hour you take back is billable, and the quality your clients see goes up, not down.",
        },
      ],
    },
    outcomes: {
      eyebrow: "Skills",
      title: "Nine things you'll be able to do",
      sub: "Find yours here — the one that regularly costs you an evening. You'll be taught all nine, but you'll start with that one.",
      skills: [
        {
          title: "Tell fact from invention",
          text: "AI invents facts, figures and quotes with total confidence. You learn to catch that before the document reaches your boss or your client.",
        },
        {
          title: "Get what you need first time",
          text: "The same request, explained properly — and there's nothing left for you to rewrite afterwards.",
        },
        {
          title: "Get through any document",
          text: "Contract, report, invoice, scan: what matters here, where the catch is, what's missing — with the page it came from.",
        },
        {
          title: "Have a helper that knows you",
          text: "No re-explaining who your clients are or how you work. It already knows, and does it your way from the start.",
        },
        {
          title: "Work by voice",
          text: "Dictate on your commute, get back a finished email, a note, or a task list for your team.",
        },
        {
          title: "Hand over what repeats",
          text: "The weekly report, the sales summary, the meeting write-up, the research — done without you in the middle of it.",
        },
        {
          title: "Test ideas risking nothing",
          text: "Your copy, your price, your proposal gets torn apart by invented customers before real ones see it.",
        },
        {
          title: "Build your own tools",
          text: "Need a calculator, a bot or a small program? You make it yourself in an evening, without knowing how to code.",
        },
        {
          title: "Take your team with you",
          text: "Put the same thing to work across your department, and show management in numbers what changed.",
        },
      ],
      stats: [
        { v: "500+", l: "Graduates" },
        { v: "2–4", l: "Weeks" },
        { v: "100%", l: "Homework reviewed" },
        { v: "0", l: "Lines of code" },
      ],
    },
    cost: {
      eyebrow: "The part nobody says out loud",
      title: "Nothing bad happens if you skip this. That's the problem.",
      text: "There's no deadline here and no disappearing bonus. If you close this page, your Monday will look exactly the same — which is precisely why it's easy to keep closing it. The loss doesn't arrive as a bill. It arrives as three hours here, a lost morning there, and a colleague who quietly got faster than you while you were busy. Two hours a week is roughly thirteen working days a year. The program costs less than one of them.",
      cta: "Start this week",
    },
    testimonials: {
      eyebrow: "Graduates",
      title: "What people say after week four",
      // Real quotes only. Each one needs a name, a role, and permission to
      // publish. An empty list hides the whole section — never fill it with
      // invented people. See docs/collect-testimonials.md.
      items: [] as { quote: string; name: string; role: string; result: string }[],
    },
    faq: {
      eyebrow: "Straight answers",
      title: "The things you're actually thinking right now",
      items: [
        {
          q: "All of this is free on YouTube. Why would I pay $150?",
          a: "Most of it is on YouTube, in pieces, scattered across hundreds of hours in no particular order, with nobody to tell you that what you built will fall apart the first time you use it under a deadline. You're not paying for information. You're paying for sequence, for homework on your own work, and for a person reading what you made. If you have 200 spare hours and the discipline to correct yourself, YouTube genuinely works — and that's the honest answer.",
        },
        {
          q: "I'm not technical at all. Will I keep up?",
          a: "Yes, and that's who it was built for. There is no programming anywhere in it. If you can use a browser and a text editor, you have everything you need. The people who struggle here aren't the non-technical ones — they're the ones who don't do the homework.",
        },
        {
          q: "I don't have time for a course right now.",
          a: "Lessons are short and the whole thing runs 2–4 weeks at your pace. You'll spend less on it per week than you currently lose to the tasks it removes — and from week one you're working on your own real material, so the time isn't extra, it's the same work done once properly.",
        },
        {
          q: "Do I need a paid AI subscription?",
          a: "You can start on free accounts. A few of the later lessons are easier on a paid plan, and we tell you exactly which ones and whether it's worth it for your situation before you spend anything.",
        },
        {
          q: "I already use ChatGPT every day. Is this too basic?",
          a: "Daily users usually get the most out of it, because they arrive with real tasks and discover how much of what they still do by hand could already be running without them. If you've built and are actively using your own custom assistants, you're past the first half of this.",
        },
        {
          q: "What happens after I send the form?",
          a: "A person emails you with start dates, how the platform works and how to join. No automated sequence, no drip campaign, no calls you didn't ask for.",
        },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "One program. One price. Everyone gets everything.",
      sub: "No tiers, no upsell at the end, no bonus module held back for the people who pay more. The same program and the same review of your work for everyone. If it returns two hours of your week, it has paid for itself inside the first month at almost any professional rate.",
      was: "$299",
      now: "$150",
      includes: [
        "All six modules on the learning platform",
        "A comprehension check after every lesson",
        "Homework built on your own real tasks",
        "A person reading and correcting what you submit",
        "Your process library — yours to keep and keep using",
      ],
      cta: "Request access",
    },
    form: {
      title: "Request access",
      sub: "Your name and email is all we need. A person replies with start dates and how to join — usually the same day.",
      name: "Your name",
      namePh: "Maria Gonzalez",
      email: "Email",
      emailPh: "you@company.com",
      submit: "Send request",
      sending: "Sending…",
      success: "Thank you — we'll be in touch shortly.",
      successSub: "A person will email you with the next steps.",
      errName: "Please enter your name.",
      errEmail: "Please enter a valid email address.",
      errSend: "Something went wrong. Please try again, or write to us directly.",
      privacy: "We use your details only to contact you about the program. No list, no resale.",
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
      pill: "Más de 500 graduados · 2–4 semanas · nada que instalar",
      title: ["Dentro de cuatro semanas", "dejarás de hacer a mano ", "lo que puede hacer la IA", "."],
      sub: "No es un montón de vídeos que nunca terminarás. Una lección, luego una tarea sobre tu trabajo real, y luego una persona que la lee y te enseña qué falla. Terminas con montajes listos que escriben tus informes, tus correos y tus resúmenes de documentos, no con una carpeta de apuntes.",
      cta: "Obtener acceso",
      ghost: "Cómo funciona",
      was: "$299",
      now: "$150",
      tags: ["ChatGPT", "Claude", "Gemini", "Tus propios ayudantes", "Sin programar"],
      app: {
        heading: "Tu progreso",
        week: "Semana 2 de 4 · 62%",
        rows: [
          { state: "done", title: "El informe semanal ya se hace solo", meta: "Entregado · corregido · funcionando", time: "18 min" },
          { state: "now", title: "Un ayudante que conoce a tus clientes", meta: "En curso · control desbloqueado", time: "24 min" },
          { state: "next", title: "De la grabación de la reunión a la lista de tareas", meta: "Se abre tras la corrección", time: "31 min" },
        ],
      },
    },
    pain: {
      eyebrow: "Por qué sigues haciéndolo a mano",
      title: "Ya sabes que la IA podría hacerlo. Justo por eso duele más.",
      items: [
        {
          q: "Has visto decenas de vídeos y aun así abres un chat en blanco, escribes algo y lo borras.",
          a: "Los vídeos enseñan funciones. Casi nadie te lleva por una tarea real de principio a fin, con tu propio material en pantalla.",
        },
        {
          q: "Lo que vuelve es pulido, genérico y un veinte por ciento incorrecto: lo reescribes y pierdes el tiempo dos veces.",
          a: "Es un problema de cómo pides las cosas, no del modelo. Se arregla con una estructura repetible, y aprenderla bien lleva unas dos horas.",
        },
        {
          q: "Cada lunes vuelves a montar el mismo informe, el mismo resumen, la misma actualización.",
          a: "Lo que se repite se puede delegar una vez y reutilizar siempre. Casi nadie llega a delegarlo, sencillamente porque nadie le enseñó cómo.",
        },
        {
          q: "Alguien de tu sector entrega en una hora lo que a ti te lleva un día, y no ves qué hace distinto.",
          a: "No escribe mejores prompts. Dejó de escribir prompts y montó procesos. Es otra actividad, y se aprende en semanas.",
        },
      ],
    },
    mechanism: {
      eyebrow: "La diferencia",
      title: "No memorizas trucos. Te montas plantillas, una por lección.",
      lede: "Los trucos se olvidan: el martes te acuerdas y el jueves ya no. Una plantilla no se olvida. Es la descripción de un trabajo que escribiste una vez y después solo vuelves a lanzar: cada lunes, para cada cliente, para cada contrato. No necesitas recordar cómo la hiciste para que siga funcionando.",
      pillars: [
        {
          n: "La montas",
          title: "Una plantilla por lección, sobre tu trabajo",
          text: "No es un ejercicio de práctica. Tu informe real, tu correo real a un cliente, tu contrato real. Tú escribes qué necesitas, en qué forma y qué hay que comprobar.",
        },
        {
          n: "La revisan",
          title: "Una persona encuentra por dónde se rompe",
          text: "Tu profesor lee lo que montaste y te enseña dónde te va a fallar en el uso real. Ningún vídeo hace eso.",
        },
        {
          n: "Te la quedas",
          title: "La plantilla es tuya para siempre",
          text: "Corregida y funcionando. Al mes tienes un conjunto entero, y siguen funcionando mucho después de que hayas olvidado cómo las hiciste.",
        },
      ],
      close: "Por eso nuestros graduados siguen usando las suyas seis meses después. Tras un curso en vídeo normal, eso casi nunca pasa.",
    },
    demo: {
      eyebrow: "Míralo",
      title: "Toda la diferencia, en un ejemplo",
      lede: "El mismo modelo, la misma tarea, cuarenta segundos más de instrucción. Elige lo que más se parezca a tu semana: la habilidad de debajo es la misma, y es lo primero que te llevas.",
      badLabel: "Lo que escribe casi todo el mundo",
      goodLabel: "Lo que escribirás al tercer día",
      resultLabel: "Lo que vuelve",
      note: "Sin palabras mágicas ni trucos. Solo estructura: quién lee, qué le importa, qué cuenta como prueba, qué forma tiene la respuesta. La estructura es una habilidad, y una vez que la tienes funciona con cualquier tarea que traigas.",
      tabs: [
        {
          id: "report",
          label: "Un informe para tu jefa",
          bad: {
            prompt: "Resume este informe trimestral para mi directora.",
            result:
              "Ocho párrafos ordenados que repiten lo que el informe ya dice. Sin criterio, sin cifras por delante, sin nada de lo que tu directora preguntó la última vez. Lo reescribes tú y te preguntas para qué empezaste.",
          },
          good: {
            prompt: [
              "Preparas una nota para mi directora: lee 90 segundos y pregunta primero por el margen.",
              "Del informe adjunto dame: tres cifras que se movieron y por qué;",
              "dos riesgos con la página que los acredita; una decisión que depende de ella.",
              "Todo lo que no puedas acreditar con el documento, apártalo como pregunta abierta.",
              "Una página. Sin adjetivos.",
            ],
            result:
              "Una nota de una página que abre con el margen, cada afirmación atada a un número de página, los riesgos separados de las suposiciones y, abajo, la decisión que ella tiene que tomar. Se envía tal cual.",
          },
        },
        {
          id: "client",
          label: "Malas noticias a un cliente",
          bad: {
            prompt: "Escribe un correo diciendo al cliente que la entrega se retrasa dos semanas.",
            result:
              "Una disculpa educada y ningún plan. El cliente se queda con una sola idea: vas tarde y no sabes qué hacer. Acto seguido llama a tu responsable.",
          },
          good: {
            prompt: [
              "El cliente esperaba la entrega el 14; será el 28. Causa: el proveedor falló un envío.",
              "Escribe el correo: la primera línea es la nueva fecha y lo que recibe esta semana igualmente.",
              "Después la causa en una frase, sin excusas. Luego qué cambiamos para que no se repita.",
              "Termina con lo único que necesito de él y para cuándo.",
              "Tono sereno y profesional. Pedir perdón una vez, no tres. Ocho líneas como máximo.",
            ],
            result:
              "Un correo que abre con la solución en vez de con la disculpa: nueva fecha, lo que llega igualmente esta semana, la causa en una línea y una pregunta concreta de vuelta. Responde con una respuesta, no con una queja.",
          },
        },
        {
          id: "contract",
          label: "Un contrato que hay que revisar",
          bad: {
            prompt: "Lee este contrato y dime qué está mal.",
            result:
              "Un repaso general de las cláusulas que acaba en «consulta con un abogado». Nada por lo que alguien discutiría de verdad, ningún número de cláusula, ninguna cifra. Acabas leyéndolo tú igualmente.",
          },
          good: {
            prompt: [
              "Revisa este contrato desde mi lado: soy el proveedor, 12.000 $, tres meses.",
              "Busca: todo lo que pueda hacerme trabajar o pagar por encima de lo acordado;",
              "todo lo que les permita rescindir sin compensación; plazos que no dependen de mí.",
              "De cada uno: la cita, el número de cláusula y una redacción que yo pueda proponer a cambio.",
              "Si una cláusula está bien, no la menciones.",
            ],
            result:
              "Seis cláusulas con citas y números: revisiones ilimitadas sin coste extra, rescisión en el día, aceptación sin plazo. Cada una con la redacción alternativa lista para enviar. Veinte minutos en vez de una tarde.",
          },
        },
      ],
    },
    method: {
      eyebrow: "Cómo es una lección",
      title: "No compras acceso. Aquí te enseñan.",
      lede: "La mayoría de los cursos de IA te entregan grabaciones y te desean suerte. Nadie comprueba si entendiste algo y tres semanas después sigues en la lección dos con una carpeta que te da mala conciencia. Aquí no puedes desviarte: cada paso tiene que cerrarse para que se abra el siguiente.",
      steps: [
        {
          n: "01",
          title: "Lección",
          text: "Breve, aplicada, construida sobre una tarea real. Sin teoría por la teoría ni introducciones de cuarenta minutos.",
        },
        {
          n: "02",
          title: "Control",
          text: "Preguntas después de cada lección. Pasar por encima de lo que no entendiste no te hace avanzar.",
        },
        {
          n: "03",
          title: "Tarea sobre tu propio trabajo",
          text: "Tus informes, tus clientes, tu bandeja de entrada. Lo que montes aquí lo usas el lunes siguiente, no es un ejercicio de laboratorio.",
        },
        {
          n: "04",
          title: "Corrección",
          text: "Una persona lee lo que entregaste y lo corrige. Ese paso es el que convierte mirar en saber.",
        },
      ],
      note: "Esto también significa que no es para quien quiere una videoteca con la que sentirse productivo. Son cuatro semanas de trabajo real, y el trabajo te toca a ti. Si no buscas eso, no lo compres: perderías tu dinero y nuestro tiempo de corrección.",
    },
    platform: {
      eyebrow: "Dónde ocurre",
      title: "Un solo sitio, y no te deja engañarte.",
      sub: "Lecciones, controles, tareas, correcciones y progreso viven en nuestra plataforma. La siguiente lección se abre cuando la anterior está realmente cerrada: esa es la diferencia entre terminar un curso y tener una carpeta.",
      bullets: [
        "Tu ruta está secuenciada: nada se abre porque hayas pasado de largo",
        "Cada entrega se lee y se responde, nada se pierde en un chat",
        "Tu biblioteca de procesos crece semana a semana y se queda contigo",
        "Portátil o móvil, en las horas que realmente tengas",
      ],
    },
    curriculum: {
      eyebrow: "Programa",
      title: "Seis módulos, y tras cada uno algo funciona",
      sub: "Cada uno está escrito como resultado, no como tema. Si un módulo no te deja una herramienta funcionando, no pinta nada aquí.",
      modules: [
        {
          n: "01",
          title: "Cómo funciona esto en realidad",
          text: "Qué son estos sistemas, en qué se diferencian y por qué la misma pregunta le da a uno una respuesta sólida y a otro un disparate. Y sobre todo: dónde la IA te miente con total seguridad.",
          result: "Sabes de qué fiarte y qué comprobar, y detectas un dato inventado en segundos.",
        },
        {
          n: "02",
          title: "Cómo pedirlo para que salga a la primera",
          text: "De qué se compone una petición que funciona: quién lo va a leer, qué cuenta como hecho, qué dejar fuera y qué forma tiene la respuesta. Además, el truco para poner a prueba una idea con clientes inventados antes de ver a los de verdad.",
          result: "Una respuesta que envías tal cual, en vez de reescribirla tú.",
        },
        {
          n: "03",
          title: "Documentos, hojas de cálculo, escaneos y fotos",
          text: "Contratos, informes, facturas, presentaciones, fotos de papeles. Encontrar lo que importa, comparar, calcular, sacar la idea y revisarlo cláusula por cláusula.",
          result: "Un documento de 60 páginas se convierte en una página legible, con la referencia de cada afirmación.",
        },
        {
          n: "04",
          title: "Un ayudante que ya te conoce",
          text: "Un asistente montado a tu medida: recuerda a tus clientes, tu estilo y tu listón. Además, dictado por voz: lo dices de camino y recibes el texto terminado.",
          result: "Dejas de explicar cada mañana quién eres y cómo trabajas.",
        },
        {
          n: "05",
          title: "La rutina que va sola",
          text: "Informes semanales, búsqueda de información, repaso de cifras, grabaciones de reuniones. Lo montas una vez y sigue solo; tú solo lo apruebas.",
          result: "El informe del lunes son diez minutos de revisión en vez de una mañana entera.",
        },
        {
          n: "06",
          title: "Tus propias herramientas, sin programar",
          text: "Un pequeño programa para tu trabajo — una calculadora, un bot, un ayudante para tu equipo — montado en una tarde, sin una sola línea de código.",
          result: "Lo que habrías esperado un trimestre de informática, lo haces tú en una tarde.",
        },
      ],
    },
    audience: {
      eyebrow: "Para quién es",
      title: "Gente que no programa y no tiene meses de sobra",
      sub: "No hace falta formación técnica. Tampoco hay nada rebajado: estarás trabajando en serio desde la primera semana.",
      cards: [
        {
          title: "Especialistas y mandos",
          text: "Marketing, análisis, RR. HH., operaciones, proyectos. Quieres ser quien cambió visiblemente su rendimiento, no quien explica por qué no cambió.",
        },
        {
          title: "Fundadores y dueños",
          text: "Quieres hacer más sin ampliar plantilla, y ver dónde se paga sola la IA antes de desplegarla al resto del equipo.",
        },
        {
          title: "Responsables y directivos",
          text: "Necesitas IA en tu departamento en una forma que sobreviva a la realidad, y una respuesta clara cuando arriba pregunten qué ha cambiado.",
        },
        {
          title: "Freelancers y consultores",
          text: "Tus ingresos topan con tu capacidad de entrega. Cada hora recuperada es facturable, y lo que ve el cliente mejora en vez de empeorar.",
        },
      ],
    },
    outcomes: {
      eyebrow: "Habilidades",
      title: "Nueve cosas que vas a saber hacer",
      sub: "Busca aquí la tuya: esa que te cuesta una tarde cada poco. Se enseñan las nueve, pero empezarás justo por esa.",
      skills: [
        {
          title: "Distinguir el dato del invento",
          text: "La IA se inventa datos, cifras y citas con total seguridad. Aprendes a pillarlo antes de que el documento llegue a tu jefa o a tu cliente.",
        },
        {
          title: "Conseguirlo a la primera",
          text: "La misma petición, explicada como toca, y ya no queda nada que reescribir después.",
        },
        {
          title: "Con cualquier documento",
          text: "Contrato, informe, factura, escaneo: qué importa aquí, dónde está la trampa, qué falta, con la página de la que sale.",
        },
        {
          title: "Un ayudante que te conoce",
          text: "Sin volver a explicar quiénes son tus clientes ni cómo trabajas. Ya lo sabe y lo hace a tu manera desde el principio.",
        },
        {
          title: "Trabajar con la voz",
          text: "Lo dictas de camino y recibes un correo terminado, una nota o una lista de tareas para tu equipo.",
        },
        {
          title: "Soltar lo que se repite",
          text: "El informe semanal, el resumen de ventas, el acta de la reunión, la búsqueda de información: hecho sin ti en medio.",
        },
        {
          title: "Probar ideas sin arriesgar nada",
          text: "Tu texto, tu precio o tu propuesta los destrozan clientes inventados antes de que los vean los de verdad.",
        },
        {
          title: "Montarte tus herramientas",
          text: "¿Necesitas una calculadora, un bot o un programita? Te lo haces en una tarde, sin saber programar.",
        },
        {
          title: "Llevarte a tu equipo",
          text: "Pones lo mismo a funcionar en tu departamento y le enseñas a dirección en cifras qué ha cambiado.",
        },
      ],
      stats: [
        { v: "500+", l: "Graduados" },
        { v: "2–4", l: "Semanas" },
        { v: "100%", l: "Tareas corregidas" },
        { v: "0", l: "Líneas de código" },
      ],
    },
    cost: {
      eyebrow: "Lo que nadie dice en voz alta",
      title: "Si te lo saltas no pasa nada malo. Ese es justo el problema.",
      text: "Aquí no hay cuenta atrás ni bonus que desaparecen. Si cierras esta página, tu lunes será exactamente igual, y por eso es tan fácil seguir cerrándola. La pérdida no llega como una factura. Llega como tres horas aquí, una mañana perdida allá y un compañero que se volvió más rápido que tú mientras estabas ocupado. Dos horas por semana son unos trece días laborables al año. El programa cuesta menos que uno de esos días.",
      cta: "Empezar esta semana",
    },
    testimonials: {
      eyebrow: "Graduados",
      title: "Lo que dicen después de la cuarta semana",
      items: [] as { quote: string; name: string; role: string; result: string }[],
    },
    faq: {
      eyebrow: "Respuestas directas",
      title: "Lo que de verdad estás pensando ahora",
      items: [
        {
          q: "Todo esto está gratis en YouTube. ¿Por qué pagar 150 $?",
          a: "Casi todo está, a trozos, repartido en cientos de horas sin ningún orden y sin nadie que te diga que lo que montaste se va a caer la primera vez que lo uses con un plazo encima. No pagas por información. Pagas por la secuencia, por hacer las tareas sobre tu propio material y por que una persona lea lo que hiciste. Si tienes 200 horas libres y la disciplina de corregirte solo, YouTube funciona de verdad, y esa es la respuesta honesta.",
        },
        {
          q: "No tengo perfil técnico. ¿Podré seguirlo?",
          a: "Sí, y para eso se hizo. No hay programación en ninguna parte. Si sabes usar un navegador y un editor de texto, tienes todo lo necesario. Aquí no sufren los no técnicos: sufren los que no hacen las tareas.",
        },
        {
          q: "Ahora mismo no tengo tiempo para un curso.",
          a: "Las lecciones son cortas y todo dura de 2 a 4 semanas a tu ritmo. Le dedicarás menos por semana de lo que ya pierdes en las tareas que elimina, y desde la primera semana trabajas sobre material real tuyo: no es tiempo extra, es el mismo trabajo hecho una vez bien.",
        },
        {
          q: "¿Necesito una suscripción de pago a la IA?",
          a: "Puedes empezar con cuentas gratuitas. Algunas lecciones finales son más cómodas con un plan de pago, y te decimos exactamente cuáles y si te compensa en tu caso antes de que gastes nada.",
        },
        {
          q: "Ya uso ChatGPT a diario. ¿Se me quedará corto?",
          a: "Quien lo usa a diario suele sacarle más, porque llega con tareas reales y descubre cuánto de lo que todavía hace a mano ya podría funcionar sin él. Si ya montaste y usas activamente tus propios asistentes, tienes hecha la primera mitad.",
        },
        {
          q: "¿Qué pasa después de enviar el formulario?",
          a: "Una persona te escribe con las fechas de inicio, cómo funciona la plataforma y cómo entrar. Sin secuencias automáticas, sin cadenas de correos, sin llamadas que no pediste.",
        },
      ],
    },
    pricing: {
      eyebrow: "Precio",
      title: "Un programa. Un precio. Todos se lo llevan todo.",
      sub: "Sin niveles, sin venta adicional al final, sin módulo bonus reservado a quien paga más. El mismo programa y la misma corrección para todos. Si te devuelve dos horas de tu semana, a cualquier tarifa profesional se paga solo dentro del primer mes.",
      was: "$299",
      now: "$150",
      includes: [
        "Los seis módulos en la plataforma de aprendizaje",
        "Un control de comprensión tras cada lección",
        "Tareas montadas sobre tus propios casos reales",
        "Una persona que lee y corrige lo que entregas",
        "Tu biblioteca de procesos, para quedártela y seguir usándola",
      ],
      cta: "Solicitar acceso",
    },
    form: {
      title: "Solicitar acceso",
      sub: "Solo necesitamos tu nombre y tu correo. Te responde una persona con las fechas de inicio y cómo entrar, normalmente el mismo día.",
      name: "Tu nombre",
      namePh: "María González",
      email: "Correo electrónico",
      emailPh: "tu@empresa.com",
      submit: "Enviar solicitud",
      sending: "Enviando…",
      success: "Gracias, nos pondremos en contacto contigo en breve.",
      successSub: "Una persona te escribirá con los siguientes pasos.",
      errName: "Introduce tu nombre, por favor.",
      errEmail: "Introduce un correo electrónico válido.",
      errSend: "Algo ha fallado. Inténtalo de nuevo o escríbenos directamente.",
      privacy: "Usamos tus datos únicamente para contactarte sobre el programa. Sin listas ni reventa.",
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
      pill: "500+ выпускников · 2–4 недели · ничего не нужно устанавливать",
      title: ["Через четыре недели", "вы перестанете делать руками ", "то, что сделает ИИ", "."],
      sub: "Это не видеокурс, который вы не досмотрите. Урок — задание на вашей настоящей работе — преподаватель проверяет и показывает, что не так. К концу у вас не конспект, а готовые заготовки, которые сами делают отчёты, письма и разбор документов.",
      cta: "Получить доступ",
      ghost: "Как это устроено",
      was: "$299",
      now: "$150",
      tags: ["ChatGPT", "Claude", "Gemini", "Свои помощники", "Без программирования"],
      app: {
        heading: "Ваш прогресс",
        week: "Неделя 2 из 4 · 62%",
        rows: [
          { state: "done", title: "Еженедельный отчёт делается сам", meta: "Сдано · проверено · работает", time: "18 мин" },
          { state: "now", title: "Помощник, который знает ваших клиентов", meta: "В работе · тест открыт", time: "24 мин" },
          { state: "next", title: "Из записи встречи — список задач", meta: "Откроется после проверки", time: "31 мин" },
        ],
      },
    },
    pain: {
      eyebrow: "Почему вы всё ещё делаете это руками",
      title: "Вы и так знаете, что ИИ мог бы это сделать. Именно поэтому обиднее всего.",
      items: [
        {
          q: "Вы посмотрели десятки видео и всё равно открываете пустой чат, что-то пишете и стираете.",
          a: "Видео показывают функции. Почти никто не проводит вас через одну реальную задачу от начала до готового результата, с вашим собственным материалом на экране.",
        },
        {
          q: "В ответ приходит гладкий, общий и процентов на двадцать неверный текст — вы переписываете его сами и теряете время дважды.",
          a: "Это проблема постановки задачи, а не модели. Лечится повторяемой структурой, и на то, чтобы освоить её как следует, уходит около двух часов.",
        },
        {
          q: "Каждый понедельник вы заново собираете тот же отчёт, ту же сводку, тот же статус.",
          a: "То, что повторяется, можно передать один раз и переиспользовать всегда. Большинство так и не передаёт — просто потому, что никто не показал, как именно.",
        },
        {
          q: "Кто-то в вашей сфере выдаёт за час то, на что у вас уходит день, и вы не видите, что он делает иначе.",
          a: "Он не пишет промпты лучше. Он перестал писать промпты и собрал процессы. Это другое занятие, и ему учатся за недели.",
        },
      ],
    },
    mechanism: {
      eyebrow: "В чём разница",
      title: "Вы не запоминаете приёмы. Вы собираете себе заготовки — по одной за урок.",
      lede: "Приёмы забываются: во вторник помните, в четверг уже нет. Заготовка не забывается. Это один раз собранное описание задачи, которое дальше просто запускаешь — каждый понедельник, для каждого клиента, для каждого договора. Вам не нужно помнить, как вы её сделали, чтобы она работала.",
      pillars: [
        {
          n: "Делаете",
          title: "Каждый урок — одна заготовка под вашу задачу",
          text: "Не учебный пример. Ваш настоящий отчёт, ваше письмо клиенту, ваш договор. Вы описываете, что нужно, в каком виде и что проверить.",
        },
        {
          n: "Проверяют",
          title: "Живой человек находит, где сломается",
          text: "Преподаватель читает то, что вы собрали, и показывает, где это подведёт вас в реальной работе. Ни одно видео так не умеет.",
        },
        {
          n: "Остаётся",
          title: "Заготовка ваша навсегда",
          text: "Исправленная и рабочая. Через месяц у вас их целый набор, и они работают, даже когда вы уже забыли, как их собирали.",
        },
      ],
      close: "Поэтому наши выпускники пользуются этим и через полгода. После обычного видеокурса так почти не бывает.",
    },
    demo: {
      eyebrow: "Посмотрите сами",
      title: "Вся разница — на одном примере",
      lede: "Та же модель, та же задача, сорок секунд дополнительной постановки. Выберите то, что ближе к вашей неделе, — навык под этим один и тот же, и его вы получаете первым.",
      badLabel: "Что пишет большинство",
      goodLabel: "Что вы напишете на третий день",
      resultLabel: "Что приходит в ответ",
      note: "Никаких секретных слов и хитростей. Только структура: кто читает, что для него важно, что считается доказательством, какой формы должен быть ответ. Структура — это навык, и однажды освоенный, он работает на любой задаче, которую вы принесёте.",
      tabs: [
        {
          id: "report",
          label: "Отчёт руководителю",
          bad: {
            prompt: "Сделай краткое содержание этого квартального отчёта для директора.",
            result:
              "Восемь аккуратных абзацев, пересказывающих то, что и так написано в отчёте. Ни оценки, ни вынесенных вперёд цифр, ничего из того, о чём директор спрашивал в прошлый раз. Вы переписываете всё сами и не понимаете, зачем начинали.",
          },
          good: {
            prompt: [
              "Ты готовишь справку директору. Она читает 90 секунд и первым делом спрашивает про маржу.",
              "Из приложенного отчёта дай: три цифры, которые изменились, и почему;",
              "два риска со ссылкой на страницу, где они подтверждены; одно решение, которое ждёт её.",
              "Всё, что не подтверждается документом, вынеси отдельно как открытый вопрос.",
              "Одна страница. Без прилагательных.",
            ],
            result:
              "Справка на одну страницу: начинается с маржи, каждое утверждение привязано к номеру страницы, риски отделены от догадок, внизу — решение, которое ей нужно принять. Отправляется как есть.",
          },
        },
        {
          id: "client",
          label: "Плохая новость клиенту",
          bad: {
            prompt: "Напиши письмо клиенту, что сроки сдвигаются на две недели.",
            result:
              "Вежливые извинения без плана. Клиент читает и выносит одно: вы опаздываете и не знаете, что с этим делать. После чего звонит вашему руководителю.",
          },
          good: {
            prompt: [
              "Клиент ждал сдачу 14-го, будет 28-го. Причина: подрядчик сорвал поставку.",
              "Напиши письмо: первая строка — новая дата и что клиент получает уже на этой неделе.",
              "Дальше причина одним предложением, без оправданий. Потом — что мы меняем, чтобы это не повторилось.",
              "В конце: что нужно от клиента и до какого числа.",
              "Тон спокойный и деловой. Извиниться один раз, а не трижды. Максимум восемь строк.",
            ],
            result:
              "Письмо, которое начинается с решения, а не с извинений: новая дата, что приходит уже на этой неделе, причина одной строкой и один конкретный вопрос. В ответ приходит ответ по делу, а не претензия.",
          },
        },
        {
          id: "contract",
          label: "Договор, который надо проверить",
          bad: {
            prompt: "Прочитай этот договор и скажи, что в нём не так.",
            result:
              "Общий пересказ пунктов с выводом «проконсультируйтесь с юристом». Ни одного пункта, за который реально зацепятся, ни одного номера, ни одной цифры. Вы всё равно читаете сами.",
          },
          good: {
            prompt: [
              "Проверь договор с моей стороны — я исполнитель, 12 000 $, три месяца.",
              "Найди: пункты, из-за которых я могу работать или платить сверх оговорённого;",
              "всё, что позволяет заказчику расторгнуть без компенсации; сроки, которые зависят не от меня.",
              "По каждому: цитата, номер пункта и формулировка, которую можно предложить взамен.",
              "Если пункт нормальный — не упоминай его.",
            ],
            result:
              "Шесть пунктов с цитатами и номерами: бесконечные правки без доплаты, расторжение день в день, приёмка без срока. К каждому — готовая формулировка для заказчика. Двадцать минут вместо вечера.",
          },
        },
      ],
    },
    method: {
      eyebrow: "Как проходит урок",
      title: "Вы покупаете не доступ. Вас здесь учат.",
      lede: "Большинство курсов по ИИ выдают записи и желают удачи. Никто не проверяет, поняли ли вы хоть что-то, и через три недели вы всё ещё на втором уроке с папкой, за которую вам неловко. Здесь съехать не получится: следующий шаг не откроется, пока не закрыт предыдущий.",
      steps: [
        {
          n: "01",
          title: "Урок",
          text: "Короткий, прикладной, построен вокруг одной реальной задачи. Без теории ради теории и получасовых вступлений.",
        },
        {
          n: "02",
          title: "Проверка",
          text: "Вопросы после каждого урока. Пролистать непонятое и двинуться дальше не выйдет.",
        },
        {
          n: "03",
          title: "Домашняя работа на вашем материале",
          text: "Ваши отчёты, ваши клиенты, ваша почта. Всё, что вы здесь соберёте, вы примените уже в ближайший понедельник, а не отложите как учебный пример.",
        },
        {
          n: "04",
          title: "Разбор",
          text: "Человек читает сданную работу и правит её. Именно этот шаг превращает просмотр в умение.",
        },
      ],
      note: "Это же значит, что курс не для тех, кому нужна видеотека, чтобы чувствовать себя продуктивным. Это четыре недели настоящей работы, и делать её придётся вам. Если вы ищете не это — не покупайте: потратите и деньги, и наше время на проверку.",
    },
    platform: {
      eyebrow: "Где это происходит",
      title: "Одно место, которое не даёт себе врать.",
      sub: "Уроки, проверки, домашние задания, разборы и прогресс живут на нашей платформе. Следующий урок открывается, когда предыдущий действительно закрыт, — в этом и разница между «прошёл курс» и «скачал папку».",
      bullets: [
        "Путь выстроен — ничего не открывается просто потому, что вы пролистали",
        "Каждая работа прочитана и отвечена, ничего не теряется в переписке",
        "Библиотека ваших процессов копится неделя за неделей и остаётся с вами",
        "Ноутбук или телефон, в те часы, которые у вас реально есть",
      ],
    },
    curriculum: {
      eyebrow: "Программа",
      title: "Шесть модулей — и после каждого что-то работает",
      sub: "Каждый описан результатом, а не темой. Если модуль не оставляет после себя работающий инструмент, ему здесь не место.",
      modules: [
        {
          n: "01",
          title: "Как это вообще работает",
          text: "Что такое нейросети, чем они друг от друга отличаются и почему один и тот же вопрос одному даёт толковый ответ, а другому — ерунду. И главное: где ИИ уверенно врёт.",
          result: "Вы понимаете, чему верить, а что перепроверять, и замечаете выдумку за секунды.",
        },
        {
          n: "02",
          title: "Как просить, чтобы получилось сразу",
          text: "Из чего состоит запрос, который срабатывает с первого раза: кто это будет читать, что считать фактом, чего не писать, в каком виде выдать. Плюс приём, которым идею проверяют на выдуманных клиентах до встречи с настоящими.",
          result: "Ответ, который отправляешь как есть, а не переписываешь руками.",
        },
        {
          n: "03",
          title: "Документы, таблицы, сканы и фото",
          text: "Договоры, отчёты, счета, презентации, фотографии бумаг. Найти нужное, сравнить, посчитать, вытащить главное, проверить по пунктам.",
          result: "Документ на 60 страниц превращается в понятную страницу — со ссылками, откуда что взято.",
        },
        {
          n: "04",
          title: "Свой помощник, который вас уже знает",
          text: "Настроенный под вас помощник: помнит ваших клиентов, ваш стиль и ваши требования. Плюс голосовой ввод — надиктовали на ходу, получили готовый текст.",
          result: "Перестаёте каждое утро объяснять заново, кто вы и как у вас принято.",
        },
        {
          n: "05",
          title: "Рутина, которая делается без вас",
          text: "Еженедельные отчёты, поиск информации, разбор цифр, записи встреч. Собрали один раз — дальше работает само, вы только проверяете.",
          result: "Понедельничный отчёт занимает не утро, а десять минут на проверку.",
        },
        {
          n: "06",
          title: "Свои инструменты без программирования",
          text: "Небольшая программа под вашу задачу — калькулятор, бот, помощник для сотрудников — собирается за вечер, без единой строчки кода.",
          result: "То, чего вы ждали от айтишников квартал, делаете сами за вечер.",
        },
      ],
    },
    audience: {
      eyebrow: "Для кого это",
      title: "Для тех, кто не пишет код и у кого нет лишних месяцев",
      sub: "Техническое образование не нужно. И ничего здесь не разжёвано до детского уровня — работать по-настоящему вы начнёте с первой недели.",
      cards: [
        {
          title: "Специалисты и менеджеры",
          text: "Маркетинг, аналитика, HR, операционка, проекты. Вы хотите быть тем, чей результат заметно изменился, а не тем, кто объясняет, почему не изменился.",
        },
        {
          title: "Предприниматели и владельцы",
          text: "Вы хотите делать больше без расширения штата и увидеть, где именно ИИ окупается, прежде чем разворачивать его на команду.",
        },
        {
          title: "Руководители и тимлиды",
          text: "Вам нужен ИИ в отделе в форме, которая переживёт столкновение с реальностью, и внятный ответ, когда наверху спросят, что изменилось.",
        },
        {
          title: "Фрилансеры и консультанты",
          text: "Ваш доход упирается в пропускную способность. Каждый возвращённый час — оплачиваемый, и качество для клиента при этом растёт, а не падает.",
        },
      ],
    },
    outcomes: {
      eyebrow: "Навыки",
      title: "Девять вещей, которые вы будете уметь",
      sub: "Найдите здесь свою — ту, из-за которой у вас регулярно горит вечер. Учить будут всем девяти, но начнёте вы именно с неё.",
      skills: [
        {
          title: "Отличать правду от выдумки",
          text: "ИИ уверенно придумывает факты, цифры и цитаты. Вы учитесь ловить это до того, как документ уйдёт руководителю или клиенту.",
        },
        {
          title: "Получать нужное с первой попытки",
          text: "Тот же самый запрос, но объяснённый правильно, — и переписывать за ИИ больше не нужно.",
        },
        {
          title: "Разбирать любые документы",
          text: "Договор, отчёт, счёт, скан: что здесь важно, где подвох, чего не хватает — со ссылками на страницы.",
        },
        {
          title: "Иметь помощника, который вас знает",
          text: "Не объясняете заново, кто ваши клиенты и как вы работаете. Он уже знает и делает сразу по-вашему.",
        },
        {
          title: "Работать голосом",
          text: "Надиктовали по дороге — получили готовое письмо, заметку или список задач команде.",
        },
        {
          title: "Снять с себя то, что повторяется",
          text: "Еженедельный отчёт, сводка по продажам, разбор встречи, подбор информации — делается без вашего участия.",
        },
        {
          title: "Проверять идеи, ничем не рискуя",
          text: "Ваш текст, цену или предложение сначала разносят выдуманные клиенты, а не настоящие.",
        },
        {
          title: "Собирать себе инструменты",
          text: "Нужен калькулятор, бот или маленькая программа — делаете сами за вечер, не умея программировать.",
        },
        {
          title: "Перевести на это не только себя",
          text: "Ставите то же самое на отдел и показываете руководству в цифрах, что изменилось.",
        },
      ],
      stats: [
        { v: "500+", l: "Выпускников" },
        { v: "2–4", l: "Недели" },
        { v: "100%", l: "Работ проверено" },
        { v: "0", l: "Строчек кода" },
      ],
    },
    cost: {
      eyebrow: "О чём обычно молчат",
      title: "Если вы это пропустите, ничего страшного не случится. В этом и проблема.",
      text: "Здесь нет дедлайна и исчезающих бонусов. Закроете страницу — ваш понедельник будет выглядеть ровно так же, и именно поэтому её так легко закрывать снова и снова. Потеря не приходит счётом. Она приходит тремя часами тут, потерянным утром там и коллегой, который тихо стал быстрее вас, пока вы были заняты. Два часа в неделю — это примерно тринадцать рабочих дней в год. Курс стоит меньше, чем один такой день.",
      cta: "Начать на этой неделе",
    },
    testimonials: {
      eyebrow: "Выпускники",
      title: "Что говорят после четвёртой недели",
      items: [] as { quote: string; name: string; role: string; result: string }[],
    },
    faq: {
      eyebrow: "Прямые ответы",
      title: "То, о чём вы сейчас на самом деле думаете",
      items: [
        {
          q: "Всё это есть бесплатно на YouTube. Зачем платить $150?",
          a: "Почти всё это действительно есть — кусками, раскиданными по сотням часов без всякого порядка, и без единого человека, который скажет вам, что собранное вами развалится в первый же раз под дедлайном. Вы платите не за информацию. Вы платите за последовательность, за домашние задания на своём материале и за то, что вашу работу читает человек. Если у вас есть 200 свободных часов и дисциплина исправлять себя самому — YouTube честно работает, и это прямой ответ.",
        },
        {
          q: "Я совсем не технарь. Справлюсь?",
          a: "Да, под это и делалось. Программирования здесь нет нигде. Если вы умеете пользоваться браузером и текстовым редактором, у вас есть всё нужное. Тяжело здесь не нетехническим людям, а тем, кто не делает домашние задания.",
        },
        {
          q: "У меня сейчас нет времени на курс.",
          a: "Уроки короткие, всё занимает 2–4 недели в вашем темпе. В неделю вы потратите меньше, чем уже теряете на задачах, которые курс убирает, — и с первой недели работаете на своём реальном материале, так что это не дополнительное время, а та же работа, сделанная один раз как следует.",
        },
        {
          q: "Нужна ли платная подписка на ИИ?",
          a: "Начать можно на бесплатных аккаунтах. Несколько поздних уроков удобнее на платном тарифе — мы честно говорим, каких именно и стоит ли оно того в вашем случае, до того как вы что-то потратите.",
        },
        {
          q: "Я и так пользуюсь ChatGPT каждый день. Не будет ли слишком просто?",
          a: "Как раз ежедневные пользователи обычно выносят больше всех: они приходят с реальными задачами и обнаруживают, сколько из того, что они всё ещё делают руками, могло бы уже работать без них. Если вы уже собрали и активно пользуетесь собственными ассистентами — первую половину курса вы прошли.",
        },
        {
          q: "Что будет после отправки формы?",
          a: "Вам напишет человек: даты старта, как устроена платформа, как попасть на обучение. Без автоворонок, цепочек писем и звонков, которых вы не просили.",
        },
      ],
    },
    pricing: {
      eyebrow: "Стоимость",
      title: "Одна программа. Одна цена. Всем достаётся всё.",
      sub: "Без тарифов, доплат в конце и бонусных модулей, придержанных для тех, кто заплатил больше. Одинаковая программа и одинаковая проверка работ для всех. Если курс вернёт вам два часа в неделю, при почти любой профессиональной ставке он окупится в первый же месяц.",
      was: "$299",
      now: "$150",
      includes: [
        "Все шесть модулей на учебной платформе",
        "Проверка усвоения после каждого урока",
        "Домашние задания на ваших реальных задачах",
        "Человек, который читает и правит сданную работу",
        "Библиотека ваших процессов — остаётся у вас",
      ],
      cta: "Оставить заявку",
    },
    form: {
      title: "Оставить заявку",
      sub: "Нужны только имя и почта. Вам ответит человек: даты старта и как попасть на обучение — обычно в тот же день.",
      name: "Ваше имя",
      namePh: "Мария Иванова",
      email: "Почта",
      emailPh: "you@company.com",
      submit: "Отправить заявку",
      sending: "Отправляем…",
      success: "Спасибо, мы свяжемся с вами в ближайшее время.",
      successSub: "Вам напишет человек и расскажет, что дальше.",
      errName: "Пожалуйста, укажите имя.",
      errEmail: "Укажите корректный адрес почты.",
      errSend: "Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.",
      privacy: "Мы используем ваши данные только чтобы связаться с вами по поводу обучения. Никаких рассылок и передачи третьим лицам.",
    },
    footer: {
      tagline: "Промпти или погибни.",
      rights: "Все права защищены.",
    },
  },
};

export type Copy = (typeof content)["en"];
