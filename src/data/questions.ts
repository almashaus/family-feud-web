export interface GameQuestion {
  id: number;
  question: string;
  answers: Array<{
    text: string;
    points: number;
    revealed: boolean;
  }>;
}

// export const gameQuestions: GameQuestion[] = [
//   {
//     id: "1",
//     question: "اذكر شيئًا تجده في المطبخ",
//     answers: [
//       { text: "ثلاجة", points: 30, revealed: false },
//       { text: "فرن", points: 25, revealed: false },
//       { text: "مغسلة", points: 20, revealed: false },
//       { text: "خزائن", points: 15, revealed: false },
//       { text: "طاولة", points: 10, revealed: false },
//       { text: "ميكروويف", points: 8, revealed: false },
//       { text: "خلاط", points: 6, revealed: false },
//       { text: "غسالة صحون", points: 5, revealed: false },
//     ],
//   },
//   {
//     id: "2",
//     question: "اذكر شيئًا يفعله الناس قبل النوم",
//     answers: [
//       { text: "تفريش الأسنان", points: 28, revealed: false },
//       { text: "قراءة", points: 22, revealed: false },
//       { text: "الصلاة", points: 20, revealed: false },
//       { text: "استخدام الهاتف", points: 18, revealed: false },
//       { text: "شرب ماء", points: 15, revealed: false },
//       { text: "مشاهدة التلفاز", points: 12, revealed: false },
//       { text: "الاستحمام", points: 10, revealed: false },
//       { text: "سماع موسيقى", points: 8, revealed: false },
//     ],
//   },
//   {
//     id: "3",
//     question: "اذكر شيئًا يخاف منه الناس",
//     answers: [
//       { text: "الظلام", points: 27, revealed: false },
//       { text: "الحشرات", points: 25, revealed: false },
//       { text: "الأفاعي", points: 20, revealed: false },
//       { text: "الفشل", points: 18, revealed: false },
//       { text: "المرتفعات", points: 15, revealed: false },
//       { text: "الأشباح", points: 12, revealed: false },
//       { text: "الوحدة", points: 10, revealed: false },
//       { text: "المرض", points: 8, revealed: false },
//     ],
//   },
//   {
//     id: "4",
//     question: "اذكر نوعًا من الرياضة",
//     answers: [
//       { text: "كرة القدم", points: 35, revealed: false },
//       { text: "كرة السلة", points: 28, revealed: false },
//       { text: "التنس", points: 20, revealed: false },
//       { text: "السباحة", points: 18, revealed: false },
//       { text: "كرة الطائرة", points: 15, revealed: false },
//       { text: "الملاكمة", points: 12, revealed: false },
//       { text: "الجري", points: 10, revealed: false },
//       { text: "الكريكيت", points: 8, revealed: false },
//     ],
//   },
//   {
//     id: "5",
//     question: "اذكر شيئًا يضعه الناس في السيارة",
//     answers: [
//       { text: "ماء", points: 25, revealed: false },
//       { text: "مناديل", points: 22, revealed: false },
//       { text: "شاحن", points: 20, revealed: false },
//       { text: "عطر", points: 18, revealed: false },
//       { text: "إطارات احتياطية", points: 15, revealed: false },
//       { text: "مظلة", points: 12, revealed: false },
//       { text: "حقيبة إسعافات أولية", points: 10, revealed: false },
//       { text: "بطانية", points: 8, revealed: false },
//     ],
//   },

//   // {
//   //   id: "1",
//   //   question: "Name something people do when they can't sleep",
//   //   answers: [
//   //     { text: "WATCH TV", points: 32, revealed: false },
//   //     { text: "READ A BOOK", points: 28, revealed: false },
//   //     { text: "COUNT SHEEP", points: 22, revealed: false },
//   //     { text: "LISTEN TO MUSIC", points: 18, revealed: false },
//   //     { text: "DRINK WARM MILK", points: 12, revealed: false },
//   //     { text: "TAKE A SHOWER", points: 8, revealed: false },
//   //     { text: "EXERCISE", points: 6, revealed: false },
//   //     { text: "CLEAN THE HOUSE", points: 4, revealed: false },
//   //   ],
//   // },
//   // {
//   //   id: "2",
//   //   question: "Name a popular pizza topping",
//   //   answers: [
//   //     { text: "PEPPERONI", points: 45, revealed: false },
//   //     { text: "CHEESE", points: 38, revealed: false },
//   //     { text: "SAUSAGE", points: 22, revealed: false },
//   //     { text: "MUSHROOMS", points: 18, revealed: false },
//   //     { text: "PEPPERS", points: 15, revealed: false },
//   //     { text: "OLIVES", points: 12, revealed: false },
//   //     { text: "ONIONS", points: 8, revealed: false },
//   //     { text: "ANCHOVIES", points: 3, revealed: false },
//   //   ],
//   // },
//   // {
//   //   id: "3",
//   //   question: "Name something you might find in a teenager's room",
//   //   answers: [
//   //     { text: "CLOTHES", points: 35, revealed: false },
//   //     { text: "PHONE", points: 30, revealed: false },
//   //     { text: "COMPUTER", points: 25, revealed: false },
//   //     { text: "POSTERS", points: 20, revealed: false },
//   //     { text: "BOOKS", points: 15, revealed: false },
//   //     { text: "MAKEUP", points: 12, revealed: false },
//   //     { text: "DIRTY DISHES", points: 8, revealed: false },
//   //     { text: "PET", points: 5, revealed: false },
//   //   ],
//   // },
//   // {
//   //   id: "4",
//   //   question: "Name a reason people call in sick to work",
//   //   answers: [
//   //     { text: "FLU/COLD", points: 40, revealed: false },
//   //     { text: "FEVER", points: 25, revealed: false },
//   //     { text: "STOMACH BUG", points: 20, revealed: false },
//   //     { text: "HEADACHE", points: 15, revealed: false },
//   //     { text: "BACK PAIN", points: 12, revealed: false },
//   //     { text: "HANGOVER", points: 10, revealed: false },
//   //     { text: "FAMILY EMERGENCY", points: 8, revealed: false },
//   //     { text: "OVERSLEPT", points: 5, revealed: false },
//   //   ],
//   // },
//   // {
//   //   id: "5",
//   //   question: "Name something people collect",
//   //   answers: [
//   //     { text: "COINS", points: 35, revealed: false },
//   //     { text: "STAMPS", points: 28, revealed: false },
//   //     { text: "BASEBALL CARDS", points: 22, revealed: false },
//   //     { text: "DOLLS", points: 18, revealed: false },
//   //     { text: "BOOKS", points: 15, revealed: false },
//   //     { text: "RECORDS", points: 12, revealed: false },
//   //     { text: "ANTIQUES", points: 8, revealed: false },
//   //     { text: "ROCKS", points: 6, revealed: false },
//   //   ],
//   // },
// ];
