import { Telegraf, Markup } from "telegraf";
import fs from "fs";

const TOKEN = "6091844559:AAG2p68kB5546x1TFt17l5Kfpb1-haQ3x3M";

const bot = new Telegraf(TOKEN);

const data = JSON.parse(fs.readFileSync("date.json"));
let time;
let drink = false;
let emoji = ["😁", "😄", "😅", "😠", "😡", "🥵", "🥶", "🤡", "💀"];
let emojiSuccess = [
  "🏃‍♀️",
  "🧎🏻‍♀️",
  "🥚",
  "🍝",
  "🏋️‍♂️",
  "⛹️",
  "🚲",
  "🎻",
  "🎮",
  "🎺",
  "🎷",
];
const awordEmoji = ['💚','💛','🧡','❤️','❤️‍🔥'];

const mainKeybord = Markup.keyboard(
  [
    "😍 Напомнить попить водички!",
    "✅ Выпил!",
    "❌ больше не напоминать!",
    "Времени осталось",
  ],
  {
    wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
  }
);

bot.start(async (ctx) => {
   await ctx.reply(`Привет! ${ctx.chat.first_name} 👑`, mainKeybord.oneTime().resize());
   console.log(ctx.message)
});

function timeWater(ctx) {
  time = 0;
  let timeEmoji = 0;

  if (drink) {
    const timeInterval = setInterval(() => {
      if (!drink) return clearInterval(timeInterval);
      if (time > 7198) {
        ctx.reply("Пришло время пить!");

        const drinkWater = setInterval(() => {
          if (!drink) return clearInterval(drinkWater);

          if (timeEmoji > 8) {
            ctx.reply(`Попей же ${emoji[timeEmoji - 1]}`);
          } else {
            ctx.reply(`Попей! ${emoji[timeEmoji]}`);
            timeEmoji++;
          }
        }, 1000);

        clearInterval(timeInterval);
      }
      time++;
    }, 1000);
  }
}

bot.hears("😍 Напомнить попить водички!", async (ctx, next) => {
  if (drink)
    return ctx.reply(
      'Время уже идет! Посмотреть можно по кнопке "Времени осталось"'
    );

  drink = true;
  ctx.reply("Через 2 часа придет напоминание!");
  timeWater(ctx);
});

bot.hears("✅ Выпил!", async (ctx) => {
  drink = false;
  setTimeout(() => {
    drink = true;
    timeWater(ctx);
  }, 1000);

  const randomEmoji =
    emojiSuccess[Math.floor(Math.random() * emojiSuccess.length)];
  const randomFact = data[Math.floor(Math.random() * data.length)];

  await ctx.reply(`${randomEmoji} следующий прием через 2 часа`);
  await ctx.reply(randomFact);
});

bot.hears("❌ больше не напоминать!", async (ctx) => {
  drink = false;
  ctx.reply("Хорошо!");
});

bot.hears("Времени осталось", (ctx) => {
  if (drink) {
    const min = Math.floor(120 - time / 60);
    if (time < 60) return ctx.reply(`Прошло только ${time} секунд о.о`);

    min < 60
      ? ctx.reply(`Осталось ${min} минут`)
      : ctx.reply(`${Math.floor(min / 60)} час ${min} минут`);
  } else {
    return ctx.reply("Вы еще не запустили время!");
  }
});

console.log('Start!!!')
bot.launch();
