export type Dimension = "EI" | "SN" | "TF" | "JP";
export type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type Bilingual = { ar: string; en: string };

export type QuestionOption = {
  /** The trait this statement shows. Never displayed to the parent. */
  pole: Pole;
  text: Bilingual;
};

export type PersonalityQuestion = {
  id: number;
  dimension: Dimension;
  /** The most telling item of its dimension; decides the result when the score is an exact tie. */
  anchor?: true;
  stem: Bilingual;
  a: QuestionOption;
  b: QuestionOption;
};

/** Each dimension's two poles. Scores are measured toward the second pole. */
export const DIMENSION_POLES: Record<Dimension, readonly [Pole, Pole]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

export const DIMENSIONS = ["EI", "SN", "TF", "JP"] as const;

/**
 * Final presentation order. Dimensions rotate so a parent can't spot the pattern, and the
 * statement that shows each pole alternates between sides so a habit of always ticking the
 * first option doesn't skew a result.
 */
export const PERSONALITY_QUESTIONS: readonly PersonalityQuestion[] = [
  {
    id: 1,
    dimension: "EI",
    stem: {
      en: "At a party or gathering where your child doesn't know anyone, they usually…",
      ar: "في حفلة أو تجمّع لا يعرف فيه طفلك أحدًا، عادةً ما…",
    },
    a: {
      pole: "I",
      text: {
        en: "Watch quietly first and join in only once they feel comfortable.",
        ar: "يراقب بهدوء أولًا ولا يندمج إلا بعد أن يشعر بالراحة.",
      },
    },
    b: {
      pole: "E",
      text: {
        en: "Walk up to other kids and start playing or chatting within minutes.",
        ar: "يتوجّه إلى الأطفال ويبدأ اللعب أو الحديث خلال دقائق.",
      },
    },
  },
  {
    id: 2,
    dimension: "SN",
    stem: {
      en: "When your child watches a movie or hears a story, what do they talk about afterwards?",
      ar: "بعد أن يشاهد طفلك فيلمًا أو يسمع قصة، عن ماذا يتحدث؟",
    },
    a: {
      pole: "S",
      text: {
        en: "What exactly happened — names, places, and specific scenes.",
        ar: "عمّا حدث بالضبط: الأسماء والأماكن والمشاهد.",
      },
    },
    b: {
      pole: "N",
      text: {
        en: "What it meant, what might happen next, or how they'd change the ending.",
        ar: "عن معناها، أو ماذا قد يحدث بعدها، أو كيف كان سيغيّر النهاية.",
      },
    },
  },
  {
    id: 3,
    dimension: "JP",
    stem: {
      en: "When your child has homework or a task to finish, they usually…",
      ar: "عندما يكون لدى طفلك واجب أو مهمة، عادةً ما…",
    },
    a: {
      pole: "P",
      text: {
        en: "Put it off and work in a burst when time is running out.",
        ar: "يؤجّلها وينجزها دفعة واحدة عندما يقترب الوقت.",
      },
    },
    b: {
      pole: "J",
      text: {
        en: "Start early and like having it done ahead of time.",
        ar: "يبدأ مبكرًا ويحب أن ينتهي منها قبل الموعد.",
      },
    },
  },
  {
    id: 4,
    dimension: "TF",
    stem: {
      en: "When your child has a disagreement with a friend, what matters most to them?",
      ar: "عندما يختلف طفلك مع صديق، ما الأهم بالنسبة له؟",
    },
    a: {
      pole: "T",
      text: {
        en: "Who is right and what is fair — they want the rules respected.",
        ar: "مَن على حق وما هو العدل — يريد احترام القواعد.",
      },
    },
    b: {
      pole: "F",
      text: {
        en: "That nobody is upset — they try to calm things down and make up.",
        ar: "ألّا يزعل أحد — يحاول تهدئة الموقف والصلح.",
      },
    },
  },
  {
    id: 5,
    dimension: "EI",
    stem: {
      en: "Given a free afternoon, your child would rather…",
      ar: "لو كان لدى طفلك وقت فراغ، فهو يفضّل…",
    },
    a: {
      pole: "E",
      text: {
        en: "Be with lots of people — friends over, a park, a busy activity.",
        ar: "أن يكون مع أشخاص كثيرين: أصدقاء، حديقة، نشاط جماعي.",
      },
    },
    b: {
      pole: "I",
      text: {
        en: "Do something on their own or with one person — drawing, reading, building.",
        ar: "أن ينشغل بشيء وحده أو مع شخص واحد: رسم، قراءة، تركيب.",
      },
    },
  },
  {
    id: 6,
    dimension: "SN",
    stem: {
      en: "When learning something new, your child learns best when…",
      ar: "عند تعلّم شيء جديد، يتعلّم طفلك أفضل عندما…",
    },
    a: {
      pole: "N",
      text: {
        en: "They discover the idea themselves and understand why it works.",
        ar: "يكتشف الفكرة بنفسه ويفهم لماذا تعمل.",
      },
    },
    b: {
      pole: "S",
      text: {
        en: "They're shown a clear example and then practise it step by step.",
        ar: "يُعرض عليه مثال واضح ثم يتدرّب عليه خطوة بخطوة.",
      },
    },
  },
  {
    id: 7,
    dimension: "JP",
    anchor: true,
    stem: {
      en: "When plans change suddenly (an outing is cancelled, a visitor arrives), your child…",
      ar: "عندما تتغيّر الخطط فجأة (إلغاء نزهة أو قدوم ضيف)، طفلك…",
    },
    a: {
      pole: "J",
      text: {
        en: "Gets uneasy and wants to know exactly what the new plan is.",
        ar: "يشعر بعدم الارتياح ويريد أن يعرف الخطة الجديدة بالضبط.",
      },
    },
    b: {
      pole: "P",
      text: {
        en: "Adapts quickly — and may even enjoy the surprise.",
        ar: "يتأقلم بسرعة، وقد يستمتع بالمفاجأة أيضًا.",
      },
    },
  },
  {
    id: 8,
    dimension: "TF",
    anchor: true,
    stem: {
      en: "What motivates your child most to keep trying?",
      ar: "ما الذي يحفّز طفلك أكثر على الاستمرار؟",
    },
    a: {
      pole: "F",
      text: {
        en: "Warm praise, encouragement, and feeling that you're proud of them.",
        ar: "المديح الدافئ والتشجيع والإحساس بأنك فخور به.",
      },
    },
    b: {
      pole: "T",
      text: {
        en: "A real challenge, a clear goal, and seeing their own results improve.",
        ar: "التحدي الحقيقي والهدف الواضح ورؤية نتائجه تتحسّن.",
      },
    },
  },
  {
    id: 9,
    dimension: "EI",
    anchor: true,
    stem: {
      en: "After a long, busy day with many people (a school trip, a family event), your child…",
      ar: "بعد يوم طويل مليء بالناس (رحلة مدرسية أو مناسبة عائلية)، طفلك…",
    },
    a: {
      pole: "I",
      text: {
        en: "Needs quiet time alone to recharge.",
        ar: "يحتاج وقتًا هادئًا وحده ليستعيد طاقته.",
      },
    },
    b: {
      pole: "E",
      text: {
        en: "Is still full of energy and wants more company or to talk about everything.",
        ar: "ما زال مليئًا بالطاقة ويريد المزيد من الصحبة أو الحديث عن كل شيء.",
      },
    },
  },
  {
    id: 10,
    dimension: "SN",
    stem: {
      en: "With a new toy or game, your child usually…",
      ar: "مع لعبة جديدة، طفلك عادةً…",
    },
    a: {
      pole: "S",
      text: {
        en: "Uses it the way it's meant to be used and gets really good at it.",
        ar: "يستخدمها بالطريقة المقصودة ويتقنها جيدًا.",
      },
    },
    b: {
      pole: "N",
      text: {
        en: "Invents new ways to use it or makes up their own game with it.",
        ar: "يخترع طرقًا جديدة لاستخدامها أو يؤلّف لعبته الخاصة بها.",
      },
    },
  },
  {
    id: 11,
    dimension: "TF",
    stem: {
      en: "When a classmate makes a mistake, your child tends to…",
      ar: "عندما يخطئ زميل، يميل طفلك إلى…",
    },
    a: {
      pole: "T",
      text: {
        en: "Point it out directly so it gets corrected.",
        ar: "أن ينبّهه مباشرة ليتم تصحيح الخطأ.",
      },
    },
    b: {
      pole: "F",
      text: {
        en: "Be gentle about it so the classmate isn't embarrassed.",
        ar: "أن يتعامل بلطف حتى لا يُحرَج زميله.",
      },
    },
  },
  {
    id: 12,
    dimension: "JP",
    stem: {
      en: "When your child has several things to do, they prefer to…",
      ar: "عندما يكون لدى طفلك عدة أشياء ليفعلها، يفضّل أن…",
    },
    a: {
      pole: "P",
      text: {
        en: "Pick whatever they feel like first and switch between them.",
        ar: "يبدأ بما يحب ويتنقّل بينها.",
      },
    },
    b: {
      pole: "J",
      text: {
        en: "Do them in a clear order — first, second, third.",
        ar: "ينجزها بترتيب واضح: الأول ثم الثاني ثم الثالث.",
      },
    },
  },
  {
    id: 13,
    dimension: "EI",
    stem: {
      en: "When your child has news or a new idea, they usually…",
      ar: "عندما يكون لدى طفلك خبر أو فكرة جديدة، عادةً ما…",
    },
    a: {
      pole: "E",
      text: {
        en: "Share it right away, often thinking out loud as they talk.",
        ar: "يشاركها فورًا، وغالبًا يفكّر بصوت عالٍ أثناء الحديث.",
      },
    },
    b: {
      pole: "I",
      text: {
        en: "Think it over first, then share it with one or two people.",
        ar: "يفكّر فيها أولًا ثم يشاركها مع شخص أو اثنين.",
      },
    },
  },
  {
    id: 14,
    dimension: "SN",
    stem: {
      en: "When your child tells you about their day, they…",
      ar: "عندما يحكي لك طفلك عن يومه، فهو…",
    },
    a: {
      pole: "N",
      text: {
        en: "Jump between ideas and connect them to other things.",
        ar: "يقفز بين الأفكار ويربطها بأشياء أخرى.",
      },
    },
    b: {
      pole: "S",
      text: {
        en: "Describe what happened in order, with clear details.",
        ar: "يصف ما حدث بالترتيب وبتفاصيل واضحة.",
      },
    },
  },
  {
    id: 15,
    dimension: "TF",
    stem: {
      en: 'When your child is corrected or told "no", they usually…',
      ar: "عندما يُصحَّح طفلك أو يُقال له \"لا\"، عادةً ما…",
    },
    a: {
      pole: "F",
      text: {
        en: "Take it to heart and feel hurt, even if it was said kindly.",
        ar: "يتأثر ويشعر بالضيق حتى لو قيلت بلطف.",
      },
    },
    b: {
      pole: "T",
      text: {
        en: "Want to know the reason, and may argue their point logically.",
        ar: "يريد معرفة السبب، وقد يناقش وجهة نظره بالمنطق.",
      },
    },
  },
  {
    id: 16,
    dimension: "JP",
    stem: {
      en: "Your child's room, bag, or desk is usually…",
      ar: "غرفة طفلك أو حقيبته أو مكتبه عادةً…",
    },
    a: {
      pole: "J",
      text: {
        en: "Organised — things have their places and they notice when something is moved.",
        ar: "منظّمة: لكل شيء مكانه ويلاحظ إذا تحرّك شيء.",
      },
    },
    b: {
      pole: "P",
      text: {
        en: "A bit messy — but they somehow know where things are.",
        ar: "غير مرتّبة قليلًا، لكنه يعرف أين أشياؤه بطريقة ما.",
      },
    },
  },
  {
    id: 17,
    dimension: "EI",
    stem: {
      en: "In class, a club, or a group activity, your child…",
      ar: "في الفصل أو النادي أو النشاط الجماعي، طفلك…",
    },
    a: {
      pole: "I",
      text: {
        en: "Prefers listening and joins in mainly when asked.",
        ar: "يفضّل الاستماع ويشارك غالبًا عندما يُطلب منه.",
      },
    },
    b: {
      pole: "E",
      text: {
        en: "Raises their hand often and enjoys being noticed.",
        ar: "يرفع يده كثيرًا ويستمتع بأن يكون محط الانتباه.",
      },
    },
  },
  {
    id: 18,
    dimension: "SN",
    anchor: true,
    stem: {
      en: "The questions your child asks most are…",
      ar: "أكثر الأسئلة التي يطرحها طفلك هي…",
    },
    a: {
      pole: "S",
      text: {
        en: '"How do I do it?" and "What is this?"',
        ar: "\"كيف أفعلها؟\" و\"ما هذا؟\"",
      },
    },
    b: {
      pole: "N",
      text: {
        en: '"Why?" and "What if…?"',
        ar: "\"لماذا؟\" و\"ماذا لو…؟\"",
      },
    },
  },
  {
    id: 19,
    dimension: "TF",
    stem: {
      en: "When choosing teams or making a group decision, your child cares most that…",
      ar: "عند اختيار الفرق أو اتخاذ قرار جماعي، أكثر ما يهمّ طفلك…",
    },
    a: {
      pole: "T",
      text: {
        en: "The choice is the smartest one to win or get the job done right.",
        ar: "أن يكون الاختيار هو الأذكى للفوز أو لإنجاز المهمة بشكل صحيح.",
      },
    },
    b: {
      pole: "F",
      text: {
        en: "Everyone is included and nobody feels left out.",
        ar: "أن يشارك الجميع ولا يشعر أحد بأنه مستبعد.",
      },
    },
  },
  {
    id: 20,
    dimension: "JP",
    stem: {
      en: "When playing a game with rules, your child…",
      ar: "عند لعب لعبة لها قواعد، طفلك…",
    },
    a: {
      pole: "P",
      text: {
        en: "Likes to suggest changes to the rules to make it more fun.",
        ar: "يحب اقتراح تغييرات على القواعد لجعلها ممتعة أكثر.",
      },
    },
    b: {
      pole: "J",
      text: {
        en: "Likes to play exactly by the rules, and reminds others to.",
        ar: "يحب اللعب بالقواعد تمامًا ويذكّر الآخرين بها.",
      },
    },
  },
];

export const QUESTION_COUNT = PERSONALITY_QUESTIONS.length;
