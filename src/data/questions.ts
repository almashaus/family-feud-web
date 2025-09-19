export interface GameQuestion {
  id: number;
  question: string;
  answers: Array<{
    text: string;
    points: number;
    revealed: boolean;
  }>;
}

export const qq = [
  {
    question:
      "Name a dessert people eat after dinner. عدد حلوى يأكلها الناس بعد العشاء",
    answers: [
      { text: "Cake", points: 25, revealed: false },
      { text: "Ice cream", points: 22, revealed: false },
      { text: "Pie", points: 18, revealed: false },
      { text: "Pudding", points: 15, revealed: false },
      { text: "Cookies", points: 10, revealed: false },
      { text: "Brownies", points: 7, revealed: false },
      { text: "Fruit salad", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a kind of sandwich meat. عدد نوع من لحوم السندويشات",
    answers: [
      { text: "Turkey", points: 25, revealed: false },
      { text: "Ham", points: 22, revealed: false },
      { text: "Chicken", points: 18, revealed: false },
      { text: "Roast beef", points: 15, revealed: false },
      { text: "Salami", points: 10, revealed: false },
      { text: "Bologna", points: 7, revealed: false },
      { text: "Tuna", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something people pack for a road trip. عدد شيئًا يحزمه الناس لرحلة على الطريق",
    answers: [
      { text: "Snacks", points: 25, revealed: false },
      { text: "Drinks", points: 22, revealed: false },
      { text: "Maps/GPS", points: 18, revealed: false },
      { text: "Music", points: 15, revealed: false },
      { text: "Clothes", points: 10, revealed: false },
      { text: "Camera", points: 7, revealed: false },
      { text: "First aid kit", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something kids do on a rainy day. عدد أشياء يفعلها الأطفال في يوم ممطر",
    answers: [
      { text: "Watch TV", points: 25, revealed: false },
      { text: "Play inside", points: 22, revealed: false },
      { text: "Read", points: 18, revealed: false },
      { text: "Play board games", points: 15, revealed: false },
      { text: "Bake/cook", points: 10, revealed: false },
      { text: "Draw/color", points: 7, revealed: false },
      { text: "Nap", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a popular fast-food chain. عدد سلسلة مطاعم وجبات سريعة مشهورة",
    answers: [
      { text: "McDonald’s", points: 25, revealed: false },
      { text: "Burger King", points: 22, revealed: false },
      { text: "KFC", points: 18, revealed: false },
      { text: "Subway", points: 15, revealed: false },
      { text: "Taco Bell", points: 10, revealed: false },
      { text: "Wendy’s", points: 7, revealed: false },
      { text: "Pizza Hut", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a fruit kids love. عدد فاكهة يحبها الأطفال",
    answers: [
      { text: "Apple", points: 25, revealed: false },
      { text: "Banana", points: 22, revealed: false },
      { text: "Strawberry", points: 18, revealed: false },
      { text: "Grapes", points: 15, revealed: false },
      { text: "Orange", points: 10, revealed: false },
      { text: "Watermelon", points: 7, revealed: false },
      { text: "Blueberry", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a holiday people celebrate. عدد عطلة يحتفل بها الناس",
    answers: [
      { text: "Christmas", points: 25, revealed: false },
      { text: "Thanksgiving", points: 22, revealed: false },
      { text: "Halloween", points: 18, revealed: false },
      { text: "Easter", points: 15, revealed: false },
      { text: "New Year’s", points: 10, revealed: false },
      { text: "Valentine’s Day", points: 7, revealed: false },
      { text: "Independence Day", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a type of pasta. عدد نوع من المعكرونة",
    answers: [
      { text: "Spaghetti", points: 25, revealed: false },
      { text: "Penne", points: 22, revealed: false },
      { text: "Macaroni", points: 18, revealed: false },
      { text: "Fettuccine", points: 15, revealed: false },
      { text: "Lasagna", points: 10, revealed: false },
      { text: "Ravioli", points: 7, revealed: false },
      { text: "Tortellini", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a common classroom item. عدد أداة شائعة في الصف الدراسي",
    answers: [
      { text: "Pencil", points: 25, revealed: false },
      { text: "Notebook", points: 22, revealed: false },
      { text: "Eraser", points: 18, revealed: false },
      { text: "Ruler", points: 15, revealed: false },
      { text: "Backpack", points: 10, revealed: false },
      { text: "Pen", points: 7, revealed: false },
      { text: "Marker", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a type of pizza topping. عدد نوع من إضافات البيتزا",
    answers: [
      { text: "Pepperoni", points: 25, revealed: false },
      { text: "Cheese", points: 22, revealed: false },
      { text: "Mushrooms", points: 18, revealed: false },
      { text: "Sausage", points: 15, revealed: false },
      { text: "Olives", points: 10, revealed: false },
      { text: "Peppers", points: 7, revealed: false },
      { text: "Pineapple", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a kind of candy. عدد نوع من الحلوى",
    answers: [
      { text: "Chocolate", points: 25, revealed: false },
      { text: "Gummies", points: 22, revealed: false },
      { text: "Lollipops", points: 18, revealed: false },
      { text: "Candy bars", points: 15, revealed: false },
      { text: "Mints", points: 10, revealed: false },
      { text: "Caramel", points: 7, revealed: false },
      { text: "Licorice", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a place people go to exercise. عدد مكان يذهب إليه الناس لممارسة الرياضة",
    answers: [
      { text: "Gym", points: 25, revealed: false },
      { text: "Park", points: 22, revealed: false },
      { text: "Home", points: 18, revealed: false },
      { text: "Track", points: 15, revealed: false },
      { text: "Pool", points: 10, revealed: false },
      { text: "Beach", points: 7, revealed: false },
      { text: "Playground", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something people do on a weekend. عدد شيئًا يفعله الناس في عطلة نهاية الأسبوع",
    answers: [
      { text: "Sleep in", points: 25, revealed: false },
      { text: "Watch TV", points: 22, revealed: false },
      { text: "Go out with friends", points: 18, revealed: false },
      { text: "Eat out", points: 15, revealed: false },
      { text: "Go shopping", points: 10, revealed: false },
      { text: "Do chores", points: 7, revealed: false },
      { text: "Exercise", points: 3, revealed: false },
    ],
  },
  {
    question: "Name a flavor of cake. عدد نكهة من الكيك",
    answers: [
      { text: "Chocolate", points: 25, revealed: false },
      { text: "Vanilla", points: 22, revealed: false },
      { text: "Red velvet", points: 18, revealed: false },
      { text: "Carrot", points: 15, revealed: false },
      { text: "Lemon", points: 10, revealed: false },
      { text: "Strawberry", points: 7, revealed: false },
      { text: "Funfetti", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something people do in the winter. عدد شيئًا يفعله الناس في الشتاء",
    answers: [
      { text: "Ski/snowboard", points: 25, revealed: false },
      { text: "Drink hot chocolate", points: 22, revealed: false },
      { text: "Wear coats", points: 18, revealed: false },
      { text: "Shovel snow", points: 15, revealed: false },
      { text: "Build snowmen", points: 10, revealed: false },
      { text: "Ice skate", points: 7, revealed: false },
      { text: "Stay indoors", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something people do at a wedding. عدد شيئًا يفعله الناس في حفل زفاف",
    answers: [
      { text: "Eat", points: 25, revealed: false },
      { text: "Dance", points: 22, revealed: false },
      { text: "Take photos", points: 18, revealed: false },
      { text: "Give gifts", points: 15, revealed: false },
      { text: "Watch ceremony", points: 10, revealed: false },
      { text: "Socialize", points: 7, revealed: false },
      { text: "Toast", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a common household pet. عدد حيوانًا أليفًا شائعًا في المنازل",
    answers: [
      { text: "Dog", points: 25, revealed: false },
      { text: "Cat", points: 22, revealed: false },
      { text: "Fish", points: 18, revealed: false },
      { text: "Bird", points: 15, revealed: false },
      { text: "Hamster", points: 10, revealed: false },
      { text: "Rabbit", points: 7, revealed: false },
      { text: "Turtle", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something people do at a picnic. عدد شيئًا يفعله الناس في النزهة",
    answers: [
      { text: "Eat", points: 25, revealed: false },
      { text: "Play games", points: 22, revealed: false },
      { text: "Relax", points: 18, revealed: false },
      { text: "Sit on blanket", points: 15, revealed: false },
      { text: "Take photos", points: 10, revealed: false },
      { text: "Listen to music", points: 7, revealed: false },
      { text: "Walk around", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a thing people pack for school. عدد شيئًا يحزمه الناس للمدرسة",
    answers: [
      { text: "Books", points: 25, revealed: false },
      { text: "Notebook", points: 22, revealed: false },
      { text: "Pencil/pen", points: 18, revealed: false },
      { text: "Lunch", points: 15, revealed: false },
      { text: "Water bottle", points: 10, revealed: false },
      { text: "Calculator", points: 7, revealed: false },
      { text: "Art supplies", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a reason people go to the library. عدد سببًا يجعل الناس يذهبون إلى المكتبة",
    answers: [
      { text: "Read books", points: 25, revealed: false },
      { text: "Study", points: 22, revealed: false },
      { text: "Borrow books", points: 18, revealed: false },
      { text: "Research", points: 15, revealed: false },
      { text: "Use computer", points: 10, revealed: false },
      { text: "Attend events", points: 7, revealed: false },
      { text: "Quiet place", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a reason someone might call 911. عدد سببًا قد يجعل شخصًا يتصل برقم 911",
    answers: [
      { text: "Fire", points: 25, revealed: false },
      { text: "Medical emergency", points: 22, revealed: false },
      { text: "Car accident", points: 18, revealed: false },
      { text: "Crime", points: 15, revealed: false },
      { text: "Disturbance", points: 10, revealed: false },
      { text: "Lost person", points: 7, revealed: false },
      { text: "Animal emergency", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something kids do at recess. عدد شيئًا يفعله الأطفال أثناء الاستراحة",
    answers: [
      { text: "Play games", points: 25, revealed: false },
      { text: "Run", points: 22, revealed: false },
      { text: "Swing", points: 18, revealed: false },
      { text: "Slide", points: 15, revealed: false },
      { text: "Play ball", points: 10, revealed: false },
      { text: "Talk with friends", points: 7, revealed: false },
      { text: "Sit/rest", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name a reason people go to a doctor. عدد سببًا يجعل الناس يذهبون إلى الطبيب",
    answers: [
      { text: "Checkup", points: 25, revealed: false },
      { text: "Illness", points: 22, revealed: false },
      { text: "Injury", points: 18, revealed: false },
      { text: "Vaccination", points: 15, revealed: false },
      { text: "Prescription refill", points: 10, revealed: false },
      { text: "Physical therapy", points: 7, revealed: false },
      { text: "Advice", points: 3, revealed: false },
    ],
  },
  {
    question:
      "Name something people bring to a camping trip. عدد شيئًا يحضره الناس في رحلة تخييم",
    answers: [
      { text: "Tent", points: 25, revealed: false },
      { text: "Sleeping bag", points: 22, revealed: false },
      { text: "Food/snacks", points: 18, revealed: false },
      { text: "Water", points: 15, revealed: false },
      { text: "Flashlight", points: 10, revealed: false },
      { text: "Clothes", points: 7, revealed: false },
      { text: "First aid kit", points: 3, revealed: false },
    ],
  },
];
