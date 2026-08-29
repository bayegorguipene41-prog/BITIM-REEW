import { LANGUAGES, DEFAULT_LANG } from "./config";

export type LangCode = (typeof LANGUAGES)[number]["code"];

type Translations = {
  [key in LangCode]: {
    brand: string;
    tagline: string;
    step1_title: string;
    step1_question: string;
    step1_placeholder: string;
    step2_title: string;
    step2_question: string;
    step3_title: string;
    step3_question: string;
    step4_title: string;
    step4_question: string;
    step4_placeholder: string;
    continue: string;
    back: string;
    discover: string;
    loading: string;
    results_title: string;
    documents_required: string;
    document_name: string;
    document_desc: string;
    source: string;
    disclaimer: string;
    restart: string;
    select_country: string;
    select_nationality: string;
    situation_work: string;
    situation_study: string;
    situation_family: string;
    situation_renewal: string;
    situation_other: string;
    required: string;
    conditional: string;
    recommended: string;
  };
};

export const t: Translations = {
  it: {
    brand: "BITIM REEW",
    tagline: "Ti aiutiamo a capire quali documenti ti servono, ovunque nel mondo.",
    step1_title: "🌍 Paese di destinazione",
    step1_question: "In quale Paese devi fare la procedura?",
    step1_placeholder: "Scegli un Paese…",
    step2_title: "🪪 Nazionalità",
    step2_question: "Di quale Paese sei cittadino?",
    step3_title: "👤 Situazione",
    step3_question: "Perché ti rechi in questo Paese?",
    step4_title: "✍️ La tua richiesta",
    step4_question: "Cosa devi fare esattamente?",
    step4_placeholder: "es. Voglio ottenere il permesso di soggiorno per lavoro…",
    continue: "Continua →",
    back: "← Indietro",
    discover: "🔍 Scopri cosa mi serve",
    loading: "Elaborazione…",
    results_title: "📋 Documenti necessari",
    documents_required: "Ecco i documenti che probabilmente ti servono",
    document_name: "Documento",
    document_desc: "Descrizione",
    source: "Fonte",
    disclaimer:
      "⚠️ Questa guida è orientativa e non sostituisce consulenza legale. Verifica sempre le fonti ufficiali prima di presentare qualsiasi domanda. Le normative possono cambiare e variare per località.",
    restart: "🔄 Ricomincia",
    select_country: "Scegli il Paese…",
    select_nationality: "Scegli la tua nazionalità…",
    situation_work: "💼 Lavoro",
    situation_study: "🎓 Studio",
    situation_family: "👨‍👩‍👧 Ricongiungimento familiare",
    situation_renewal: "🔄 Rinnovo permesso",
    situation_other: "ℹ️ Altro",
    required: "Obbligatorio",
    conditional: "Se applicabile",
    recommended: "Consigliato",
  },
  en: {
    brand: "BITIM REEW",
    tagline: "We help you understand which documents you need, anywhere in the world.",
    step1_title: "🌍 Destination Country",
    step1_question: "In which country do you need to complete the procedure?",
    step1_placeholder: "Choose a country…",
    step2_title: "🪪 Nationality",
    step2_question: "Which country are you a citizen of?",
    step3_title: "👤 Your situation",
    step3_question: "Why are you moving to this country?",
    step4_title: "✍️ Your request",
    step4_question: "What do you need to do exactly?",
    step4_placeholder: "e.g. I want to obtain a residence permit for work…",
    continue: "Continue →",
    back: "← Back",
    discover: "🔍 Find out what I need",
    loading: "Processing…",
    results_title: "📋 Required Documents",
    documents_required: "Here are the documents you will likely need",
    document_name: "Document",
    document_desc: "Description",
    source: "Source",
    disclaimer:
      "⚠️ This guide is for informational purposes only and does not constitute legal advice. Always verify official sources before submitting any application. Regulations may change and vary by location.",
    restart: "🔄 Start over",
    select_country: "Select country…",
    select_nationality: "Select your nationality…",
    situation_work: "💼 Work",
    situation_study: "🎓 Study",
    situation_family: "👨‍👩‍👧 Family reunification",
    situation_renewal: "🔄 Permit renewal",
    situation_other: "ℹ️ Other",
    required: "Required",
    conditional: "If applicable",
    recommended: "Recommended",
  },
  fr: {
    brand: "BITIM REEW",
    tagline: "Nous vous aidons à comprendre quels documents vous avez besoin, où que vous soyez.",
    step1_title: "🌍 Pays de destination",
    step1_question: "Dans quel pays devez-vous accomplir la procédure ?",
    step1_placeholder: "Choisissez un pays…",
    step2_title: "🪪 Nationalité",
    step2_question: "De quel pays êtes-vous citoyen ?",
    step3_title: "👤 Votre situation",
    step3_question: "Pourquoi vous rendez-vous dans ce pays ?",
    step4_title: "✍️ Votre demande",
    step4_question: "Que devez-vous faire exactement ?",
    step4_placeholder: "ex: Je veux obtenir un titre de séjour pour travail…",
    continue: "Continuer →",
    back: "← Retour",
    discover: "🔍 Découvrir ce dont j'ai besoin",
    loading: "Traitement…",
    results_title: "📋 Documents nécessaires",
    documents_required: "Voici les documents dont vous aurez probablement besoin",
    document_name: "Document",
    document_desc: "Description",
    source: "Source",
    disclaimer:
      "⚠️ Ce guide est informatif et ne remplace pas un conseil juridique. Vérifiez toujours les sources officielles avant de déposer une demande.",
    restart: "🔄 Recommencer",
    select_country: "Choisissez un pays…",
    select_nationality: "Choisissez votre nationalité…",
    situation_work: "💼 Travail",
    situation_study: "🎓 Études",
    situation_family: "👨‍👩‍👧 Regroupement familial",
    situation_renewal: "🔄 Renouvellement",
    situation_other: "ℹ️ Autre",
    required: "Obligatoire",
    conditional: "Si applicable",
    recommended: "Recommandé",
  },
  es: {
    brand: "BITIM REEW",
    tagline: "Te ayudamos a entender qué documentos necesitas, en cualquier parte del mundo.",
    step1_title: "🌍 País de destino",
    step1_question: "¿En qué país debes realizar el trámite?",
    step1_placeholder: "Elige un país…",
    step2_title: "🪪 Nacionalidad",
    step2_question: "¿De qué país eres ciudadano?",
    step3_title: "👤 Tu situación",
    step3_question: "¿Por qué te trasladaste a este país?",
    step4_title: "✍️ Tu solicitud",
    step4_question: "¿Qué necesitas hacer exactamente?",
    step4_placeholder: "ej: Quiero obtener el permiso de residencia por trabajo…",
    continue: "Continuar →",
    back: "← Volver",
    discover: "🔍 Descubre lo que necesito",
    loading: "Procesando…",
    results_title: "📋 Documentos necesarios",
    documents_required: "Estos son los documentos que probablemente necesitarás",
    document_name: "Documento",
    document_desc: "Descripción",
    source: "Fuente",
    disclaimer:
      "⚠️ Esta guía es informativa y no sustituye asesoría legal. Verifica siempre las fuentes oficiales antes de presentar cualquier solicitud.",
    restart: "🔄 Empezar de nuevo",
    select_country: "Elige un país…",
    select_nationality: "Elige tu nacionalidad…",
    situation_work: "💼 Trabajo",
    situation_study: "🎓 Estudio",
    situation_family: "👨‍👩‍👧 Reagrupación familiar",
    situation_renewal: "🔄 Renovación",
    situation_other: "ℹ️ Otro",
    required: "Obligatorio",
    conditional: "Si aplica",
    recommended: "Recomendado",
  },
  ar: {
    brand: "بيتيم ريوس",
    tagline: "نساعدك على معرفة المستندات التي تحتاجها، في أي مكان في العالم.",
    step1_title: "🌍 بلد الوجهة",
    step1_question: "في أي بلد تقوم بالإجراءات؟",
    step1_placeholder: "اختر دولة…",
    step2_title: "🪪 الجنسية",
    step2_question: "من أي دولة أنت مواطن؟",
    step3_title: "👤 حالتك",
    step3_question: "لماذا تذهب إلى هذا البلد؟",
    step4_title: "✍️ طلبك",
    step4_question: "ما الذي تريد فعله بالضبط؟",
    step4_placeholder: "مثال: أريد الحصول على تصريح إقامة للعمل…",
    continue: "متابعة →",
    back: "← رجوع",
    discover: "🔍 اكتشف ما أحتاجه",
    loading: "جاري المعالجة…",
    results_title: "📋 المستندات المطلوبة",
    documents_required: "هذه المستندات التي ستحتاجها على الأرجح",
    document_name: "المستند",
    document_desc: "الوصف",
    source: "المصدر",
    disclaimer:
      "⚠️ هذا الدليل إرشادي ولا يُستشار قانونيًا. تحقق دائمًا من المصادر الرسمية قبل تقديم أي طلب.",
    restart: "🔄 البدء من جديد",
    select_country: "اختر دولة…",
    select_nationality: "اختر جنسيتك…",
    situation_work: "💼 عمل",
    situation_study: "🎓 دراسة",
    situation_family: "👨‍👩‍👧 لم الشمل العائلي",
    situation_renewal: "🔄 تجديد",
    situation_other: "ℹ️ آخر",
    required: "إلزامي",
    conditional: "إن وجد",
    recommended: "موصى به",
  },
};

// Lingue di fallback: se manca una traduzione usa l'italiano
export function getTranslation(lang: string | undefined) {
  const code = lang && Object.keys(t).includes(lang) ? lang : DEFAULT_LANG;
  return t[code as LangCode];
}