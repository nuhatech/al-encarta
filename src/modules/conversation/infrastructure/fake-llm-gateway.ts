import type {
  LlmGateway,
  LlmRequest,
  StreamChunk,
} from "@/src/modules/conversation/application/ports/llm-port";

/**
 * Deterministic mock LLM that simulates Claude streaming the byte-stable
 * personality response. Used until ANTHROPIC_API_KEY is configured.
 *
 * Picks a canned reply based on the personality referenced in the system
 * prompt (we sniff the displayName), then drips it character-by-character
 * with realistic timing.
 */
export class FakeLlmGateway implements LlmGateway {
  async streamCompletion(req: LlmRequest): Promise<ReadableStream<StreamChunk>> {
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const userText = lastUser?.content ?? "";
    const reply = pickReply(req.systemBlocks.map((b) => b.text).join("\n"), userText);

    return new ReadableStream<StreamChunk>({
      async start(controller) {
        await sleep(120);
        for (const word of tokenize(reply)) {
          controller.enqueue({ type: "text-delta", delta: word });
          await sleep(18 + Math.floor(Math.random() * 25));
        }
        controller.enqueue({ type: "done" });
        controller.close();
      },
    });
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

type Persona =
  | "al-khawarizmi"
  | "ibn-al-haytham"
  | "ibn-al-nafis"
  | "ibn-battuta"
  | "ibn-khaldoun"
  | "fatima-al-fihri"
  | "unknown";

function detectPersona(systemPrompt: string): Persona {
  if (/al-Khawarizmi/i.test(systemPrompt)) return "al-khawarizmi";
  if (/al-Haytham/i.test(systemPrompt)) return "ibn-al-haytham";
  if (/al-Nafis/i.test(systemPrompt)) return "ibn-al-nafis";
  if (/Battuta/i.test(systemPrompt)) return "ibn-battuta";
  if (/Khaldoun|Khaldun/i.test(systemPrompt)) return "ibn-khaldoun";
  if (/al-Fihri/i.test(systemPrompt)) return "fatima-al-fihri";
  return "unknown";
}

function isGreeting(t: string): boolean {
  const trimmed = t.trim().toLowerCase();
  return (
    trimmed.length === 0 ||
    /^(bonjour|salut|hello|salam|peace|hi|hey|coucou|bonsoir)\b/.test(trimmed)
  );
}

function pickReply(systemPrompt: string, userText: string): string {
  const persona = detectPersona(systemPrompt);
  const trimmed = userText.trim().toLowerCase();
  const greeting = isGreeting(trimmed);

  switch (persona) {
    case "al-khawarizmi":
      if (greeting) {
        return "Salam, voyageur. Tu trouves un savant penché sur ses tables et ses manuscrits dans la Maison de la Sagesse de Bagdad. Le calife al-Ma'mun nous demande de mettre par écrit ce que les Indiens ont compris des nombres, et ce que les Grecs ont laissé d'Euclide. Que veux-tu apprendre — l'art d'al-jabr, le mouvement des astres, ou la mesure des terres ?";
      }
      if (/algèbre|algebre|al[- ]?jabr|équation|equation/.test(trimmed)) {
        return "L'al-jabr, c'est l'art de restaurer. Quand tu as une chose inconnue mêlée à des biens et des nombres, tu déplaces les termes pour rétablir l'équilibre des deux côtés de la balance. Je décris six formes canoniques — un bien égal à des racines, des biens égaux à des nombres, et ainsi de suite. Pour chacune, j'enseigne la règle de résolution avec une démonstration géométrique. Ce que tu appelles 'équation', je l'appelle 'l'égalité de deux choses pesées'.";
      }
      return "Voilà une question intéressante. Laisse-moi y réfléchir comme un géomètre — d'abord poser ce que je sais, ensuite ce que je cherche, puis trouver le pont entre les deux. Peux-tu reformuler ce que tu veux savoir ? Mes oreilles d'érudit du 9ème siècle ne saisissent pas toujours les tournures modernes.";

    case "ibn-al-haytham":
      if (greeting) {
        return "Salut à toi. Tu me trouves dans ma cellule du Caire, où le calife al-Hakim m'a placé en assignation après mes promesses imprudentes sur le Nil. C'est une bénédiction déguisée — j'ai eu sept ans pour observer la lumière qui passe par mon volet et écrire mon Kitab al-Manazir. Que veux-tu savoir : l'œil, la chambre noire, ou la méthode pour connaître la vérité des choses ?";
      }
      if (/lumière|optique|vision|œil/.test(trimmed)) {
        return "Euclide et Ptolémée se sont trompés. Ils croyaient qu'un rayon sortait de l'œil pour palper le monde. C'est l'inverse : la lumière entre dans l'œil depuis les objets. Je l'ai démontré par la chambre noire — un trou minuscule dans le volet, et l'image d'une bougie se forme inversée sur le mur d'en face. Si l'œil émettait, comment l'image se ferait-elle dans une chambre vide ? La vérité demande l'expérience, mon ami, pas l'autorité des anciens.";
      }
      return "Je ne réponds qu'à ce que j'ai pu observer ou démontrer. Reformule ta question pour que je puisse y appliquer la méthode : poser ce qui est connu, distinguer ce qui est conjecturé, et tester par l'expérience.";

    case "ibn-al-nafis":
      if (greeting) {
        return "Que la paix soit sur toi. Tu me trouves à l'hôpital al-Mansuri du Caire, entre une ronde des malades et la rédaction de mon commentaire sur le Canon d'Ibn Sina. La médecine vraie naît de l'observation, non de la répétition des anciens. Que veux-tu apprendre — l'anatomie du cœur, le souffle des poumons, ou les remèdes que nous administrons ?";
      }
      if (/cœur|coeur|sang|circulation|poumon/.test(trimmed)) {
        return "Galien s'est trompé. Il croyait que le sang traversait le septum cardiaque par des pores invisibles. Mais quand on dissèque, on ne trouve aucun pore — le septum est épais et étanche. Le sang fait un tout autre voyage : du ventricule droit, il monte par l'artère pulmonaire, se mêle à l'air dans le tissu poreux des poumons, puis revient au ventricule gauche par la veine pulmonaire. Le souffle (rûh) du sang naît dans les poumons, pas dans le cœur. Cela, je l'écris dans mon commentaire — qui osera me croire ?";
      }
      return "La médecine demande de la patience. Pose ta question simplement — qu'observes-tu chez le malade ? Quelles sont ses humeurs, son pouls, son urine ? Sans cela je ne peux conseiller utilement.";

    case "ibn-battuta":
      if (greeting) {
        return "Salam ! Quelle joie de rencontrer un voyageur. Je viens de Tanger, mais je n'y suis presque plus. Trente ans de routes — la Mecque, Damas, Bagdad, l'Inde du sultan Tughluq, la Chine des jonques, le Mali de Mansa Souleymane, et tant d'autres. Demande-moi ce que tu veux savoir — un pays, une ville, une coutume, un fruit. Mes yeux ont vu, et ma mémoire est bonne.";
      }
      if (/inde|delhi/.test(trimmed)) {
        return "Ah, Delhi ! J'y ai été cadi pendant huit ans, sous Muhammad bin Tughluq — un sultan brillant et terrible, qui distribuait des fortunes et faisait exécuter des hommes le même matin. La cité grouille de monde, les éléphants des défilés royaux, les marchés bigarrés où l'on trouve des étoffes de Chine et des rubis du Badakhshan. Le sultan m'a fait son ambassadeur en Chine, mais notre flotte a fait naufrage dans la mer de l'Inde. C'est une autre histoire.";
      }
      if (/chine|pékin|jonque/.test(trimmed)) {
        return "La Chine des Yuan ! Pays étrange et magnifique. À Hangzhou, la plus grande ville que j'aie vue — six villes en une, six portes, six gouverneurs. Les jonques, des navires immenses avec quatre ponts, douze voiles, des cabines pour les marchands. Mais la nourriture — porc, chien, grenouille — m'a souvent contraint à jeûner. Les chinois sont habiles, propres, et leur papier-monnaie m'a stupéfié.";
      }
      return "Mon ami, raconte-moi mieux ce que tu cherches — un pays, un peuple, un sultan, une coutume. J'ai trop voyagé pour répondre à une question vague. Précise et je te raconterai.";

    case "ibn-khaldoun":
      if (greeting) {
        return "La paix sur toi. Tu me trouves à la forteresse d'Ibn Salama, en pays berbère — j'y achève la Muqaddima après des années de tumulte au service des sultans. La peste m'a pris mes parents, la mer m'a pris ma femme et mes enfants. Il me reste l'écriture et le devoir d'expliquer comment naissent et tombent les civilisations. Que veux-tu comprendre — l'asabiyya, le cycle des dynasties, ou la nature des villes et du désert ?";
      }
      if (/asabiyya|dynastie|civilisation|société|societe/.test(trimmed)) {
        return "L'asabiyya, c'est la cohésion qui unit les hommes du même sang ou du même clan face à l'adversité. Les Bédouins l'ont — ils vivent durement, se défendent ensemble, méprisent le luxe. Les citadins l'ont perdue — ils s'amollissent dans le confort, paient des soldats étrangers, perdent l'habitude du combat. Une dynastie naît quand un peuple à forte asabiyya conquiert les villes ; elle meurt quand, en trois ou quatre générations, ses descendants ont oublié le désert. C'est le cycle des choses humaines.";
      }
      return "Pose ta question avec précision, mon ami. La science de la civilisation veut des distinctions claires : entre nomade et sédentaire, entre dynastie naissante et déclinante, entre causes lointaines et immédiates.";

    case "fatima-al-fihri":
      if (greeting) {
        return "Bismillah, et la paix sur toi. Tu me trouves à Fès, dans la mosquée que ma sœur Mariam et moi avons fondée — al-Qarawiyyin, du nom de notre Kairouan natale. Notre père Muhammad nous a laissées riches en partant ; nous avons fait le vœu d'employer son héritage pour quelque chose qui dure. Que veux-tu savoir — la fondation, les premiers étudiants, ou ce que ça signifiait pour deux femmes de bâtir une école au temps des Idrissides ?";
      }
      if (/université|universite|école|ecole|qarawiyyin|fondation/.test(trimmed)) {
        return "L'idée n'était pas grandiose, à l'époque. Je voulais une mosquée, une école pour les sciences religieuses, une bibliothèque pour les manuscrits qu'on apporterait, un hammam et une fontaine pour les voyageurs. Le chantier a duré deux années pendant lesquelles j'ai jeûné par reconnaissance. J'ai supervisé moi-même les artisans, fait venir des fuqaha de Kairouan pour enseigner. Que cette modeste école devienne ce qu'elle est devenue — l'aïeule de toutes les universités, dit-on — c'est wa Allahu a'lam, Dieu seul l'a su.";
      }
      return "Pose ta question simplement, mon ami. Je ne suis qu'une bâtisseuse de Fès, et je réponds à ce que je sais — la mosquée, le chantier, mes contemporains.";

    default:
      return genericGreeting(systemPrompt, greeting);
  }
}

function genericGreeting(systemPrompt: string, isGreet: boolean): string {
  // Try to extract the displayName from "Tu es <Name>" pattern in the prompt.
  const match = /Tu es ([^,\.]+?)(?:,|\.)/.exec(systemPrompt);
  const name = match?.[1]?.trim() ?? "ce personnage";
  if (isGreet) {
    return `Salam et bienvenue. Je suis ${name}. Le mock LLM ne dispose pas de répliques détaillées pour mon époque — pose ANTHROPIC_API_KEY dans .env.local pour discuter avec moi via Claude Sonnet 4.6 (vrai roleplay), ou pose-moi une question simple à laquelle je puisse répondre par une intro générique.`;
  }
  return `Mon ami, le mock LLM ne couvre que des questions simples pour ${name}. Pour une conversation riche, configure ANTHROPIC_API_KEY — je serai alors animé par Claude Sonnet 4.6 (tier 1) ou Claude Haiku 4.5 (tier 2) avec mon system prompt complet et byte-stable.`;
}
