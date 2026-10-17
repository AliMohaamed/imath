import type { ArticleCopy } from "@/content/types";
import type { Locale } from "@/navigation";

/** The UCMath program page. Facts here must match the pricing plans and FAQ in messages/*.json. */
export const PROGRAM_UPDATED_AT = "2026-10-16";

export const PROGRAM_COPY: Record<Locale, ArticleCopy> = {
  ar: {
    title: "منهج UCMath للحساب الذهني من iMath",
    description:
      "تعرّف على منهج UCMath للحساب الذهني في iMath: من العداد (السوروبان) إلى الحساب في الذهن، بحصص فردية 1:1 أونلاين للأطفال من 4 إلى 18 سنة.",
    h1: "منهج UCMath لتعليم الحساب الذهني في iMath",
    summary:
      "UCMath منهج منظّم لتعليم الحساب الذهني يدرسه الأطفال من 4 إلى 18 سنة في iMath. يبدأ الطفل بالعداد (السوروبان) ليرى الأرقام بعينيه، ثم ينتقل تدريجيًا إلى تخيّل العداد في ذهنه، حتى يحسب بسرعة ودقة دون أي أداة. كل ذلك في حصص فردية 1:1 أونلاين، بالعربية أو الإنجليزية.",
    sections: [
      {
        heading: "كيف يتعلّم الطفل مع UCMath؟",
        blocks: [
          {
            type: "ol",
            items: [
              "العداد باليد: يتعلّم الطفل تمثيل الأعداد والمنازل (آحاد، عشرات، مئات) والجمع والطرح بتحريك خرزات السوروبان.",
              "التخيّل الذهني: يتدرّب على رؤية العداد في ذهنه وتحريك خرزاته ذهنيًا.",
              "السرعة والتطبيق: يحسب في ذهنه دون أدوات، ويتابع أرقامًا تظهر بسرعة، وينتقل إلى أعداد أكبر والضرب.",
            ],
          },
          {
            type: "p",
            text: "لماذا نبدأ بالعداد؟ لأنه يعطي الطفل صورة ملموسة للأرقام قبل أن يُطلب منه تخيّلها. اقرأ المزيد في [الفرق بين الحساب الذهني والعداد](/resources/mental-math-vs-abacus).",
          },
        ],
      },
      {
        heading: "شكل الحصص",
        blocks: [
          {
            type: "ul",
            items: [
              "حصص فردية 1:1: معلّم واحد لطفل واحد طوال الحصة.",
              "مدة الحصة 60 دقيقة، بمعدل حصتين أسبوعيًا (8 حصص شهريًا).",
              "أونلاين بالكامل، بالعربية أو الإنجليزية حسب ما يناسب طفلك.",
              "إمكانية إعادة جدولة الحصص عبر فريق الدعم على واتساب.",
            ],
          },
        ],
      },
      {
        heading: "المستويات والمتابعة",
        blocks: [
          {
            type: "ul",
            items: [
              "يتقدّم الطفل مستوى بعد مستوى، وتختلف مدة المستوى حسب قدرة كل طالب وتقدّمه: بعضهم يُنهيه في شهر، وآخرون في شهرين أو ثلاثة.",
              "شهادة إتمام عند إنهاء كل مستوى.",
              "تقرير شهري لولي الأمر عن تقدّم الطفل ونقاط قوته وأهداف الشهر التالي.",
            ],
          },
        ],
      },
      {
        heading: "من أين يبدأ طفلك؟",
        blocks: [
          {
            type: "p",
            text: "لا نحدّد البداية حسب العمر فقط. يمكنك أن تبدأ بـ[اختبار المستوى المجاني](/assessment/level): لعبة قصيرة تضع طفلك على مقياس من ستة مستويات خلال دقائق. ثم احجز حصة تجريبية مجانية ليقيّم المعلّم مستواه ويقترح خطة البداية.",
          },
        ],
      },
      {
        heading: "لمن يناسب منهج UCMath؟",
        blocks: [
          {
            type: "ul",
            items: [
              "الأطفال من 4 إلى 18 سنة، سواء كانوا مبتدئين تمامًا أو لديهم أساس في الحساب.",
              "الطفل الذي يعتمد على العدّ بالأصابع أو يتردّد أمام مسائل الرياضيات.",
              "الطفل المتفوّق الذي يريد سرعة ودقة أعلى.",
            ],
          },
        ],
      },
    ],
    faq: [
      {
        question: "ما هو UCMath؟",
        answer:
          "UCMath منهج منظّم لتعليم الحساب الذهني خطوة بخطوة: يبدأ بالعداد (السوروبان)، ثم التخيّل الذهني، ثم الحساب في الذهن دون أدوات.",
      },
      {
        question: "هل الحصص فردية أم جماعية؟",
        answer: "كل حصص iMath فردية 1:1: معلّم واحد لطفل واحد.",
      },
      {
        question: "كيف أتابع تقدّم طفلي؟",
        answer: "ترسل لك iMath تقريرًا شهريًا عن تقدّم طفلك ونقاط قوته وأهداف الشهر التالي، مع شهادة عند إتمام كل مستوى.",
      },
    ],
  },
  en: {
    title: "The UCMath Mental Math Method by iMath",
    description:
      "Meet the UCMath mental math method at iMath: from the abacus (soroban) to calculating in the mind, in 1:1 online classes for kids aged 4–18.",
    h1: "The UCMath Method for Teaching Mental Math at iMath",
    summary:
      "UCMath is a structured method for teaching mental math, followed by children aged 4 to 18 at iMath. Children start with the abacus (soroban) so they can see numbers, then gradually learn to picture the abacus in their mind, until they calculate quickly and accurately without any tool. All of it in 1:1 online classes, in Arabic or English.",
    sections: [
      {
        heading: "How children learn with UCMath",
        blocks: [
          {
            type: "ol",
            items: [
              "Hands-on abacus: children learn to represent numbers and place value (ones, tens, hundreds) and to add and subtract by moving soroban beads.",
              "Visualisation: they practise seeing the abacus in their mind and moving its beads mentally.",
              "Speed and application: they calculate in their head without tools, follow numbers flashed quickly, and move on to bigger numbers and multiplication.",
            ],
          },
          {
            type: "p",
            text: "Why start with the abacus? Because it gives children a concrete picture of numbers before they're asked to imagine them. Read more in [mental math vs abacus](/resources/mental-math-vs-abacus).",
          },
        ],
      },
      {
        heading: "What the classes look like",
        blocks: [
          {
            type: "ul",
            items: [
              "1:1 classes: one tutor and one child for the whole session.",
              "60-minute sessions, twice a week (8 sessions a month).",
              "Fully online, in Arabic or English, whichever suits your child.",
              "Sessions can be rescheduled through our WhatsApp support team.",
            ],
          },
        ],
      },
      {
        heading: "Levels and progress tracking",
        blocks: [
          {
            type: "ul",
            items: [
              "Children progress level by level; how long a level takes depends on each student's ability and progress: some finish one in a month, others take two or three.",
              "A completion certificate at the end of each level.",
              "A monthly report for parents on progress, strengths and next month's goals.",
            ],
          },
        ],
      },
      {
        heading: "Where does your child start?",
        blocks: [
          {
            type: "p",
            text: "We don't set the starting point by age alone. You can begin with the [free level test](/assessment/level): a short game that places your child on a six-level scale in minutes. Then book a free trial class so a tutor can assess your child and suggest a starting plan.",
          },
        ],
      },
      {
        heading: "Who is UCMath for?",
        blocks: [
          {
            type: "ul",
            items: [
              "Children aged 4 to 18, whether complete beginners or already comfortable with basic arithmetic.",
              "Children who count on their fingers or hesitate in front of math problems.",
              "Strong students who want more speed and accuracy.",
            ],
          },
        ],
      },
    ],
    faq: [
      {
        question: "What is UCMath?",
        answer:
          "UCMath is a structured method for teaching mental math step by step: it starts with the abacus (soroban), moves to visualisation, then to calculating in the mind without tools.",
      },
      {
        question: "Are classes 1:1 or in groups?",
        answer: "All iMath classes are 1:1: one tutor, one child.",
      },
      {
        question: "How do I track my child's progress?",
        answer:
          "iMath sends you a monthly report on your child's progress, strengths and next month's goals, plus a certificate when each level is completed.",
      },
    ],
  },
};
