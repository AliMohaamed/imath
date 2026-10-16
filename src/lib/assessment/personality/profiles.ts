import type { Bilingual, Pole } from "./questions";
import type { PersonalityProfile } from "./scoring";

/**
 * Report copy. Text may hold `{name}` and, for Arabic, `{masculine|feminine}` pairs that
 * `personalize()` resolves from the child's gender. English uses the neutral "they".
 */
type Titled = { title: Bilingual; text: Bilingual };

export type ProfileContent = {
  superpower: Bilingual;
  title: Bilingual;
  /** Title once the Outgoing / Reflective side is added, e.g. "The Quiet Precision Master". */
  variants: Record<"E" | "I", Bilingual>;
  tagline: Bilingual;
  overview: Bilingual;
  traits: [Titled, Titled, Titled];
  strengths: [Titled, Titled, Titled];
  challenges: [Titled, Titled, Titled];
  mathPower: Bilingual;
  parentTips: [Bilingual, Bilingual, Bilingual];
  learnAtImath: Bilingual;
  closing: Bilingual;
};

const t = (en: string, ar: string): Bilingual => ({ en, ar });
const item = (titleEn: string, titleAr: string, textEn: string, textAr: string): Titled => ({
  title: t(titleEn, titleAr),
  text: t(textEn, textAr),
});

export const PROFILES: Record<PersonalityProfile, ProfileContent> = {
  precision: {
    superpower: t("Precision", "الدقّة"),
    title: t("The Precision Master", "{سيّد|سيّدة} الدقّة"),
    variants: {
      I: t("The Quiet Precision Master", "{سيّد|سيّدة} الدقّة {الهادئ|الهادئة}"),
      E: t("The Team Precision Master", "{سيّد|سيّدة} الدقّة {الاجتماعي|الاجتماعية}"),
    },
    tagline: t("careful, organised and dependable", "{دقيق|دقيقة} و{منظّم|منظّمة} ويُعتمد {عليه|عليها}"),
    overview: t(
      "{name} likes things done properly. They notice small details, feel calm when the steps are clear, and take real pride in getting it right. People can count on {name}, and in mental math that care turns into accurate answers and steady habits.",
      "{name} {يحب|تحب} أن تُنجَز الأمور بشكل صحيح. {يلاحظ|تلاحظ} التفاصيل الصغيرة، و{يشعر|تشعر} بالراحة عندما تكون الخطوات واضحة، و{يفخر|تفخر} حقًا بأن تكون {إجابته|إجابتها} صحيحة. يمكن الاعتماد على {name}، وفي الحساب الذهني تتحوّل هذه العناية إلى إجابات دقيقة وعادات ثابتة."
    ),
    traits: [
      item(
        "An eye for detail",
        "عين للتفاصيل",
        "Notices the small things others miss.",
        "{يلاحظ|تلاحظ} الأشياء الصغيرة التي يفوتها الآخرون."
      ),
      item(
        "Loves clear steps",
        "{يحب|تحب} الخطوات الواضحة",
        "Feels confident when they know what comes next.",
        "{يشعر|تشعر} بالثقة عندما {يعرف|تعرف} ما سيأتي بعد ذلك."
      ),
      item(
        "Dependable",
        "{يُعتمد عليه|يُعتمد عليها}",
        "Finishes what they start.",
        "{ينهي|تنهي} ما {يبدأه|تبدأه}."
      ),
    ],
    strengths: [
      item(
        "Accuracy",
        "الدقّة",
        "Careful checking means fewer careless mistakes.",
        "المراجعة بعناية تعني أخطاءً أقل بسبب الاستعجال."
      ),
      item(
        "Method",
        "اتّباع الطريقة",
        "Follows a method patiently from start to finish.",
        "{يتّبع|تتّبع} الطريقة بصبر من البداية إلى النهاية."
      ),
      item(
        "Steady habits",
        "عادات ثابتة",
        "Builds regular practice that leads to real progress.",
        "{يبني|تبني} تدريبًا منتظمًا يقود إلى تقدّم حقيقي."
      ),
    ],
    challenges: [
      item(
        "Sudden change",
        "التغيير المفاجئ",
        "Can feel uneasy when a task or plan changes without warning.",
        "قد {يشعر|تشعر} بعدم الارتياح عندما تتغيّر المهمة أو الخطة دون تنبيه."
      ),
      item(
        "Pressure from the clock",
        "ضغط الوقت",
        "May slow down to stay perfect when a timer is running.",
        "قد {يبطئ|تبطئ} لتبقى الإجابة مثالية عندما يكون الوقت محدودًا."
      ),
      item(
        "Trying new ways",
        "تجربة طرق جديدة",
        "Can hesitate before trying an unfamiliar method.",
        "قد {يتردد|تتردد} قبل تجربة طريقة غير مألوفة."
      ),
    ],
    mathPower: t(
      "Accuracy. {name} tends to get answers right and to notice errors, which is the foundation every fast calculator needs.",
      "الدقّة. غالبًا ما {يصل|تصل} {name} إلى الإجابة الصحيحة و{يلاحظ|تلاحظ} الأخطاء، وهذا هو الأساس الذي يحتاجه كل حاسب سريع."
    ),
    parentTips: [
      t(
        "Give a heads-up before changes, even small ones: \"In 5 minutes we'll switch to something new.\"",
        "نبّه {طفلك|طفلتك} قبل أي تغيير حتى لو كان صغيرًا: «بعد 5 دقائق سننتقل إلى شيء جديد»."
      ),
      t(
        "Praise effort and flexibility, not only perfect results.",
        "امدح الجهد والمرونة، وليس النتائج المثالية فقط."
      ),
      t(
        "Let them try quick estimates where a wrong answer costs nothing.",
        "دَع {طفلك|طفلتك} يجرّب التقدير السريع في مواقف لا يضرّ فيها الخطأ."
      ),
    ],
    learnAtImath: t(
      "Our tutor will keep each session predictable: a clear plan at the start and one step at a time, then a short surprise challenge so {name} grows comfortable with change.",
      "سيجعل معلمنا كل حصة واضحة ومتوقعة: خطة في البداية وخطوة واحدة في كل مرة، ثم تحدٍّ مفاجئ قصير حتى {يعتاد|تعتاد} {name} على التغيير."
    ),
    closing: t(
      "{name} has a careful, dependable mind. With practice, that precision can become speed too.",
      "{name} {يملك|تملك} عقلًا دقيقًا يُعتمد عليه. ومع التدريب، يمكن لهذه الدقّة أن تصبح سرعة أيضًا."
    ),
  },

  speed: {
    superpower: t("Speed", "السرعة"),
    title: t("The Speed Racer", "{بطل|بطلة} السرعة"),
    variants: {
      I: t("The Focused Speed Racer", "{بطل|بطلة} السرعة {المركّز|المركّزة}"),
      E: t("The Team Speed Racer", "{بطل|بطلة} السرعة {الاجتماعي|الاجتماعية}"),
    },
    tagline: t("quick, hands-on and full of energy", "{سريع|سريعة} و{عملي|عملية} و{مليء|مليئة} بالطاقة"),
    overview: t(
      "{name} learns by doing. They jump in, try things out and love a challenge or a race. Long routines can feel slow, but give them something active and they light up. In mental math, that energy becomes fast recall and quick reactions.",
      "{name} {يتعلّم|تتعلّم} بالتجربة. {يبادر|تبادر} ويجرّب و{يحب|تحب} التحدي والسباق. قد تبدو الروتينات الطويلة بطيئة، لكن إذا أعطيته شيئًا نشطًا {يتحمّس|تتحمّس}. وفي الحساب الذهني تتحوّل هذه الطاقة إلى استرجاع سريع وردود فعل سريعة."
    ),
    traits: [
      item(
        "Hands-on learner",
        "{يتعلّم|تتعلّم} بالتجربة",
        "Understands best by trying it out.",
        "{يفهم|تفهم} أفضل عندما {يجرّب|تجرّب} بنفسه."
      ),
      item(
        "Loves a challenge",
        "{يحب|تحب} التحدي",
        "Gets more focused when there is a race or a goal.",
        "{يزداد|تزداد} تركيزًا عندما يكون هناك سباق أو هدف."
      ),
      item(
        "Adapts fast",
        "{يتأقلم|تتأقلم} بسرعة",
        "Changes plans easily and may enjoy the surprise.",
        "{يغيّر|تغيّر} الخطط بسهولة وقد {يستمتع|تستمتع} بالمفاجأة."
      ),
    ],
    strengths: [
      item(
        "Quick reactions",
        "ردود فعل سريعة",
        "Answers fast once the idea is clear.",
        "{يجيب|تجيب} بسرعة بمجرد أن تتضح الفكرة."
      ),
      item(
        "Energy for games",
        "طاقة للألعاب",
        "Enjoys timed rounds and friendly competition.",
        "{يستمتع|تستمتع} بالجولات المحدّدة بوقت وبالمنافسة اللطيفة."
      ),
      item(
        "Bounces back",
        "{ينهض|تنهض} من جديد",
        "A wrong answer rarely slows them down for long.",
        "نادرًا ما يُبطئ الخطأ {خطواته|خطواتها} لوقت طويل."
      ),
    ],
    challenges: [
      item(
        "Rushing",
        "الاستعجال",
        "May answer before checking.",
        "قد {يجيب|تجيب} قبل أن {يراجع|تراجع}."
      ),
      item(
        "Long repetitive practice",
        "التدريب الطويل المتكرر",
        "Can lose interest when practice feels slow or repetitive.",
        "قد {يفقد|تفقد} الاهتمام عندما يبدو التدريب بطيئًا أو متكررًا."
      ),
      item(
        "Finishing",
        "الإنهاء",
        "Might start several things before finishing one.",
        "قد {يبدأ|تبدأ} عدة أشياء قبل أن {ينهي|تنهي} واحدًا منها."
      ),
    ],
    mathPower: t(
      "Speed. {name} reacts fast and enjoys racing the clock, which is the engine of quick mental calculation.",
      "السرعة. {يتفاعل|تتفاعل} {name} بسرعة و{يستمتع|تستمتع} بالسباق مع الوقت، وهذا هو محرّك الحساب الذهني السريع."
    ),
    parentTips: [
      t(
        "Turn practice into short games with a timer.",
        "حوّل التدريب إلى ألعاب قصيرة بمؤقّت."
      ),
      t(
        "Add a \"check it\" step before saying the final answer.",
        "أضف خطوة «راجِع» قبل قول الإجابة النهائية."
      ),
      t(
        "Keep sessions short and varied: 10 focused minutes beat 30 slow ones.",
        "اجعل الجلسات قصيرة ومتنوّعة: 10 دقائق مركّزة أفضل من 30 دقيقة مملّة."
      ),
    ],
    learnAtImath: t(
      "Sessions will be lively and game-based, with quick rounds and a built-in habit of checking before answering, so {name}'s speed stays accurate.",
      "ستكون الحصص حيوية وقائمة على الألعاب، بجولات سريعة وعادة ثابتة للمراجعة قبل الإجابة، لتبقى سرعة {name} دقيقة."
    ),
    closing: t(
      "{name} has a fast, flexible mind. Add a little checking and that speed becomes fast and right.",
      "{name} {يملك|تملك} عقلًا سريعًا ومرنًا. أضف قليلًا من المراجعة وستصبح هذه السرعة سريعة وصحيحة."
    ),
  },

  visualisation: {
    superpower: t("Visualisation", "التخيّل"),
    title: t("The Creative Visualiser", "{المبدع|المبدعة} {الخيالي|الخيالية}"),
    variants: {
      I: t("The Dreamy Visualiser", "{المبدع|المبدعة} {الحالم|الحالمة}"),
      E: t("The Team Visualiser", "{المبدع|المبدعة} {الاجتماعي|الاجتماعية}"),
    },
    tagline: t("imaginative, kind and picture-minded", "{خيالي|خيالية} و{لطيف|لطيفة} و{يفكّر|تفكّر} بالصور"),
    overview: t(
      "{name} sees the world in ideas and pictures. They are gentle with others, thrive on encouragement and often think in images and stories. That is exactly the skill behind the mental abacus, where numbers become pictures that can be moved around in the mind.",
      "{name} {يرى|ترى} العالم أفكارًا وصورًا. {لطيف|لطيفة} مع الآخرين، و{ينمو|تنمو} بالتشجيع، وغالبًا {يفكّر|تفكّر} بالصور والقصص. وهذه هي المهارة نفسها وراء المعداد الذهني، حيث تتحوّل الأرقام إلى صور يمكن تحريكها في الذهن."
    ),
    traits: [
      item(
        "Imaginative",
        "{خيالي|خيالية}",
        "Connects ideas and invents new ways of seeing things.",
        "{يربط|تربط} الأفكار و{يبتكر|تبتكر} طرقًا جديدة للنظر إلى الأشياء."
      ),
      item(
        "Warm and encouraging",
        "{دافئ|دافئة} و{مشجّع|مشجّعة}",
        "Notices how others feel and wants everyone included.",
        "{يلاحظ|تلاحظ} مشاعر الآخرين و{يريد|تريد} أن يشارك الجميع."
      ),
      item(
        "Sensitive to feedback",
        "{حسّاس|حسّاسة} تجاه الملاحظات",
        "Takes words to heart, so tone matters.",
        "{يتأثر|تتأثر} بالكلمات، لذلك تفرق نبرة الصوت."
      ),
    ],
    strengths: [
      item(
        "Strong inner pictures",
        "صور ذهنية قوية",
        "Can hold an image in mind, the key to the mental abacus.",
        "{يستطيع|تستطيع} الاحتفاظ بصورة في الذهن، وهي مفتاح المعداد الذهني."
      ),
      item(
        "Creative problem solving",
        "حلّ المشكلات بإبداع",
        "Finds a way of their own to reach an answer.",
        "{يجد|تجد} طريقته الخاصة للوصول إلى الإجابة."
      ),
      item(
        "Team spirit",
        "روح الفريق",
        "Cooperative and supportive when working with others.",
        "{متعاون|متعاونة} و{داعم|داعمة} عند العمل مع الآخرين."
      ),
    ],
    challenges: [
      item(
        "Mistakes feel personal",
        "الخطأ يبدو شخصيًا",
        "May feel discouraged after a wrong answer.",
        "قد {يشعر|تشعر} بالإحباط بعد إجابة خاطئة."
      ),
      item(
        "Drifting off",
        "شرود الذهن",
        "Can get lost in ideas and lose track of the steps.",
        "قد {يضيع|تضيع} في الأفكار و{ينسى|تنسى} الخطوات."
      ),
      item(
        "Competition",
        "المنافسة",
        "May feel uneasy when things become a race.",
        "قد {يشعر|تشعر} بعدم الارتياح عندما تتحوّل الأمور إلى سباق."
      ),
    ],
    mathPower: t(
      "Visualisation. {name} can turn numbers into pictures, which is how the fastest mental calculators work.",
      "التخيّل. {يستطيع|تستطيع} {name} تحويل الأرقام إلى صور، وهكذا يعمل أسرع الحاسبين ذهنيًا."
    ),
    parentTips: [
      t(
        "Name what they did well before correcting anything.",
        "اذكر ما أحسنه {طفلك|طفلتك} قبل تصحيح أي شيء."
      ),
      t(
        "Let them draw or imagine the numbers before solving.",
        "دَع {طفلك|طفلتك} يرسم الأرقام أو يتخيّلها قبل الحل."
      ),
      t(
        "Describe mistakes as \"the brain growing\", not as failure.",
        "صِف الأخطاء بأنها «نموّ للعقل» وليست فشلًا."
      ),
    ],
    learnAtImath: t(
      "Our tutor will lead with encouragement, link every skill to a picture and keep corrections gentle, so {name}'s confidence grows alongside speed.",
      "سيبدأ معلمنا بالتشجيع، ويربط كل مهارة بصورة، ويُبقي التصحيح لطيفًا، لتنمو ثقة {name} مع السرعة."
    ),
    closing: t(
      "{name} has a creative, caring mind. With a little structure, those inner pictures can become lightning-fast answers.",
      "{name} {يملك|تملك} عقلًا مبدعًا ولطيفًا. ومع قليل من التنظيم، يمكن أن تصبح هذه الصور الذهنية إجابات سريعة كالبرق."
    ),
  },

  logic: {
    superpower: t("Logic", "المنطق"),
    title: t("The Pattern Detective", "{محقّق|محقّقة} الأنماط"),
    variants: {
      I: t("The Quiet Pattern Detective", "{محقّق|محقّقة} الأنماط {الهادئ|الهادئة}"),
      E: t("The Team Pattern Detective", "{محقّق|محقّقة} الأنماط {الاجتماعي|الاجتماعية}"),
    },
    tagline: t("curious, logical and independent", "{فضولي|فضولية} و{منطقي|منطقية} و{مستقل|مستقلة}"),
    overview: t(
      "{name} wants to know why. They enjoy puzzles, spot patterns and prefer reasons to rules. They like a real challenge and want to see their own progress. In mental math, that curiosity turns into clever shortcuts and strong number sense.",
      "{name} {يريد|تريد} أن {يعرف|تعرف} السبب. {يستمتع|تستمتع} بالألغاز و{يلتقط|تلتقط} الأنماط و{يفضّل|تفضّل} الأسباب على القواعد. {يحب|تحب} التحدي الحقيقي و{يريد|تريد} أن {يرى|ترى} تقدّمه. وفي الحساب الذهني يتحوّل هذا الفضول إلى اختصارات ذكية وحسّ قوي بالأرقام."
    ),
    traits: [
      item(
        "Always asks why",
        "{يسأل|تسأل} دائمًا لماذا",
        "Wants the reason behind every rule.",
        "{يريد|تريد} معرفة السبب وراء كل قاعدة."
      ),
      item(
        "Pattern spotter",
        "{يلتقط|تلتقط} الأنماط",
        "Notices the repeats and shortcuts hidden in numbers.",
        "{يلاحظ|تلاحظ} التكرار والاختصارات الخفية في الأرقام."
      ),
      item(
        "Self-driven",
        "{دافعه|دافعها} ذاتي",
        "Motivated by a clear goal and their own results.",
        "{يحرّكه|تحرّكها} هدف واضح ونتائجه الخاصة."
      ),
    ],
    strengths: [
      item(
        "Shortcuts and patterns",
        "الاختصارات والأنماط",
        "Finds quicker ways to reach an answer.",
        "{يجد|تجد} طرقًا أسرع للوصول إلى الإجابة."
      ),
      item(
        "Real understanding",
        "فهم حقيقي",
        "Knows why a method works, not just how.",
        "{يعرف|تعرف} لماذا تنجح الطريقة، وليس كيف فقط."
      ),
      item(
        "Drive to improve",
        "الرغبة في التحسّن",
        "Gets motivated by beating their own best.",
        "{يتحفّز|تتحفّز} بتجاوز {رقمه|رقمها} القياسي."
      ),
    ],
    challenges: [
      item(
        "Patience with drills",
        "الصبر على التمارين",
        "May find repetition dull once they understand the idea.",
        "قد {يجد|تجد} التكرار مملًا بعد أن {يفهم|تفهم} الفكرة."
      ),
      item(
        "Bluntness",
        "المباشرة الزائدة",
        "Can sound blunt when pointing out mistakes.",
        "قد يبدو {كلامه|كلامها} مباشرًا أكثر من اللازم عند الإشارة إلى الأخطاء."
      ),
      item(
        "Asking for help",
        "طلب المساعدة",
        "May prefer to struggle alone rather than ask.",
        "قد {يفضّل|تفضّل} أن {يحاول|تحاول} وحده بدل أن {يسأل|تسأل}."
      ),
    ],
    mathPower: t(
      "Logic. {name} looks for patterns and reasons, which builds deep number sense and clever shortcuts.",
      "المنطق. {يبحث|تبحث} {name} عن الأنماط والأسباب، وهذا يبني حسًّا عميقًا بالأرقام واختصارات ذكية."
    ),
    parentTips: [
      t(
        "Answer \"why\" questions, or ask them to explain their own thinking.",
        "أجب عن أسئلة «لماذا»، أو اطلب من {طفلك|طفلتك} أن يشرح تفكيره."
      ),
      t(
        "Show progress in numbers: scores, levels and streaks.",
        "أظهر التقدّم بالأرقام: درجات ومستويات وأيام متواصلة."
      ),
      t(
        "Remind them that practice builds speed, even when the idea is already clear.",
        "ذكّر {طفلك|طفلتك} أن التدريب يبني السرعة حتى لو كانت الفكرة واضحة."
      ),
    ],
    learnAtImath: t(
      "Our tutor will explain the reason behind each technique, set stretch challenges and let {name} track their own progress.",
      "سيشرح معلمنا السبب وراء كل أسلوب، ويقدّم تحديات متدرّجة، ويترك {name} يتابع تقدّمه بنفسه."
    ),
    closing: t(
      "{name} has a sharp, curious mind. With regular practice, those clever ideas can become quick, confident answers.",
      "{name} {يملك|تملك} عقلًا حادًا وفضوليًا. ومع التدريب المنتظم، يمكن أن تصبح هذه الأفكار الذكية إجابات سريعة وواثقة."
    ),
  },
};

type PoleContent = { title: Bilingual; text: Bilingual; bullets: [Bilingual, Bilingual, Bilingual] };

export const POLES: Record<Pole, PoleContent> = {
  E: {
    title: t("Energised by people", "{يستمد|تستمد} {طاقته|طاقتها} من الناس"),
    text: t(
      "{name} gets energy from being with others and enjoys talking things through.",
      "{name} {يستمد|تستمد} {طاقته|طاقتها} من التواجد مع الآخرين و{يستمتع|تستمتع} بالحديث عن الأشياء."
    ),
    bullets: [
      t("Shares ideas out loud", "{يشارك|تشارك} الأفكار بصوت عالٍ"),
      t("Joins groups easily", "{ينضم|تنضم} إلى المجموعات بسهولة"),
      t("Enjoys being noticed", "{يستمتع|تستمتع} بأن {يكون|تكون} محط الانتباه"),
    ],
  },
  I: {
    title: t("Recharges in calm", "{يستعيد|تستعيد} {طاقته|طاقتها} بالهدوء"),
    text: t(
      "{name} thinks things through quietly and recharges with calm time.",
      "{name} {يفكّر|تفكّر} بهدوء و{يستعيد|تستعيد} {طاقته|طاقتها} بالوقت الهادئ."
    ),
    bullets: [
      t("Watches before joining in", "{يراقب|تراقب} قبل أن {يشارك|تشارك}"),
      t("Prefers one or two close friends", "{يفضّل|تفضّل} صديقًا أو اثنين مقرّبين"),
      t("Shares ideas once they are ready", "{يشارك|تشارك} الأفكار عندما {يكون|تكون} {جاهزًا|جاهزة}"),
    ],
  },
  S: {
    title: t("Learns from real examples", "{يتعلّم|تتعلّم} من الأمثلة الواقعية"),
    text: t(
      "{name} trusts what can be seen and tried, and likes clear examples.",
      "{name} {يثق|تثق} بما يمكن رؤيته وتجربته، و{يحب|تحب} الأمثلة الواضحة."
    ),
    bullets: [
      t("Remembers facts and details", "{يتذكّر|تتذكّر} الحقائق والتفاصيل"),
      t("Likes clear, step-by-step examples", "{يحب|تحب} الأمثلة الواضحة خطوة بخطوة"),
      t("Learns well by doing", "{يتعلّم|تتعلّم} جيدًا بالتطبيق"),
    ],
  },
  N: {
    title: t("Sees the big picture", "{يرى|ترى} الصورة الكبيرة"),
    text: t(
      "{name} is drawn to ideas, meanings and what could be.",
      "{name} {ينجذب|تنجذب} إلى الأفكار والمعاني وما يمكن أن يكون."
    ),
    bullets: [
      t("Asks \"why\" and \"what if\"", "{يسأل|تسأل} «لماذا» و«ماذا لو»"),
      t("Connects ideas together", "{يربط|تربط} الأفكار ببعضها"),
      t("Likes inventing new ways", "{يحب|تحب} ابتكار طرق جديدة"),
    ],
  },
  T: {
    title: t("Decides with reasons", "{يقرّر|تقرّر} بالمنطق"),
    text: t(
      "{name} looks for what is fair and logical, and wants to know the reason.",
      "{name} {يبحث|تبحث} عمّا هو عادل ومنطقي و{يريد|تريد} معرفة السبب."
    ),
    bullets: [
      t("Wants the reason behind rules", "{يريد|تريد} معرفة سبب القواعد"),
      t("Speaks directly and honestly", "{يتكلم|تتكلم} بصراحة ومباشرة"),
      t("Motivated by goals and results", "{يتحفّز|تتحفّز} بالأهداف والنتائج"),
    ],
  },
  F: {
    title: t("Decides with heart", "{يقرّر|تقرّر} بالقلب"),
    text: t(
      "{name} notices how others feel and works to keep everyone happy.",
      "{name} {يلاحظ|تلاحظ} مشاعر الآخرين و{يعمل|تعمل} على إسعاد الجميع."
    ),
    bullets: [
      t("Notices how others feel", "{يلاحظ|تلاحظ} مشاعر الآخرين"),
      t("Looks for harmony", "{يبحث|تبحث} عن الانسجام"),
      t("Thrives on encouragement", "{ينمو|تنمو} بالتشجيع"),
    ],
  },
  J: {
    title: t("Likes a plan", "{يحب|تحب} الخطة"),
    text: t(
      "{name} feels best with order, routines and knowing what comes next.",
      "{name} {يشعر|تشعر} بأفضل حال مع الترتيب والروتين ومعرفة ما سيحدث بعد ذلك."
    ),
    bullets: [
      t("Finishes tasks early", "{ينهي|تنهي} المهام مبكرًا"),
      t("Prefers clear routines", "{يفضّل|تفضّل} الروتين الواضح"),
      t("Feels uneasy about sudden change", "{يشعر|تشعر} بعدم الارتياح من التغيير المفاجئ"),
    ],
  },
  P: {
    title: t("Stays flexible", "{يبقى|تبقى} {مرنًا|مرنة}"),
    text: t(
      "{name} likes to keep options open and learns by trying things out.",
      "{name} {يحب|تحب} إبقاء الخيارات مفتوحة و{يتعلّم|تتعلّم} بالتجربة."
    ),
    bullets: [
      t("Adapts quickly", "{يتأقلم|تتأقلم} بسرعة"),
      t("Likes to keep options open", "{يحب|تحب} إبقاء الخيارات مفتوحة"),
      t("Works well in bursts of energy", "{يعمل|تعمل} جيدًا في دفعات من النشاط"),
    ],
  },
};

/** How iMath trains each power; shown for the three the child isn't naturally strongest in. */
export const POWER_TRAINING: Record<PersonalityProfile, Bilingual> = {
  precision: t(
    "Checking habits and estimation, so answers are right the first time.",
    "عادات المراجعة والتقدير، لتكون الإجابات صحيحة من المرة الأولى."
  ),
  speed: t(
    "Short timed drills that grow gently, so quick recall feels safe.",
    "تمارين قصيرة بوقت محدّد تزداد تدريجيًا، ليصبح الاسترجاع السريع مريحًا."
  ),
  visualisation: t(
    "Mental abacus practice, so numbers turn into pictures in the mind.",
    "التدريب على المعداد الذهني، لتتحوّل الأرقام إلى صور في الذهن."
  ),
  logic: t(
    "Pattern games and shortcuts that show why a method works.",
    "ألعاب الأنماط والاختصارات التي توضّح لماذا تنجح الطريقة."
  ),
};
