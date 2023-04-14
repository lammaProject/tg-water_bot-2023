import { Telegraf, Markup } from "telegraf";
import fs from "fs";

const TOKEN = "6290552808:AAHIduCawXKgTjqahlkfYJ-CPzFwQFfJb0o";

const bot = new Telegraf(TOKEN);
const users = JSON.parse(fs.readFileSync("users.json"));

function saveUsers() {
  return fs.writeFileSync("users.json", JSON.stringify(users));
}

const data = JSON.parse(fs.readFileSync("date.json"));
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

const awardEmojiList = ["💚", "💛", "🧡", "❤️", "❤️‍🔥"];

const mainKeybord = Markup.keyboard(
  [
    "😍 Напомнить попить водички!",
    "Времени осталось",
    "✅ Выпил!",
    "❌ Больше не напоминать!",
    "👑 Награды",
  ],
  {
    wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 3,
  }
);

const awardKeybord = Markup.keyboard([], {
  wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / btn,
}).resize();

const offtenTimeKeyboard = Markup.keyboard([], {
  wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 5,
}).resize();

bot.start(async (ctx) => {
  const userId = ctx.message.from.id;
  console.log(users);
  ctx.reply(
    `Привет! ${ctx.chat.first_name} 👑`,
    mainKeybord.oneTime().resize()
  );

  if (!users[userId]) {
    users[userId] = {
      awadEmojiAll: [],
      timeDrink: 0,
      oftenTime: ["Закрыть"],
    };

    saveUsers();
  }
});

function timeWater(ctx, userId) {
  users[userId].time = 0;
  users[userId].timeEmoji = 0;

  if (users[userId].drink) {
    const timeInterval = setInterval(() => {
      if (!users[userId].drink) return clearInterval(timeInterval);
      if (Math.floor(users[userId].time) / 60 > users[userId].timeToNeed) {
        ctx.reply("Пришло время пить!");

        const drinkWater = setInterval(() => {
          if (!users[userId].drink) return clearInterval(drinkWater);

          if (users[userId].timeEmoji > 8) {
            ctx.reply(`Попей же ${emoji[users[userId].timeEmoji - 1]}`);
          } else {
            ctx.reply(`Попей! ${emoji[users[userId].timeEmoji]}`);
            users[userId].timeEmoji++;
          }

          saveUsers();
        }, 1000);

        clearInterval(timeInterval);
      }

      users[userId].time++;
      saveUsers();
    }, 1000);
  }
}

bot.hears("😍 Напомнить попить водички!", async (ctx, next) => {
  const userId = ctx.message.from.id;

  if (offtenTimeKeyboard.reply_markup.keyboard.length < 1) {
    offtenTimeKeyboard.reply_markup.keyboard.push(users[userId].oftenTime);
  }

  offtenTimeKeyboard.reply_markup.keyboard.splice(
    0,
    1,
    users[userId].oftenTime
  );

  ctx.reply("Ставь время!", offtenTimeKeyboard);
  console.log(offtenTimeKeyboard.reply_markup);

  bot.on("message", (ctx) => {
    const userId = ctx.message.from.id;
    const reg = /^\d+$/;
    const messageText = ctx.message.text;
    if (reg.test(messageText)) {
      const hours = Math.floor(messageText / 60);
      const minutes = messageText % 60;
      hours === 0
        ? ctx.reply(`${minutes} мин!`, mainKeybord)
        : ctx.reply(`${hours}час ${minutes}мин!`, mainKeybord);
      users[userId].timeToNeed = messageText;

      if (users[userId].drink) users[userId].drink = false;

      setTimeout(() => {
        users[userId].drink = true;
        if (users[userId].oftenTime.some((item) => item === ctx.message.text)) {
        } else {
          if (users[userId].oftenTime.length > 5) {
            users[userId].oftenTime.pop();
          }
          users[userId].oftenTime.splice(1, 0, ctx.message.text);
        }
        timeWater(ctx, userId);
        saveUsers();
      }, 1000);
    }
  });
});

bot.hears("Закрыть", (ctx) => {
  ctx.reply("Когда решишься напиши!", mainKeybord);
});

bot.hears("✅ Выпил!", async (ctx) => {
  const userId = ctx.from.id;

  users[userId].timeDrink++;

  switch (users[userId].timeDrink) {
    case 10:
      users[userId].awadEmojiAll.push(awardEmojiList[0]);
      awardKeybord.reply_markup.keyboard.push(users[userId].awadEmojiAll);
      await ctx.reply("💚 загляни в награды!");
      break;
    case 20:
      users[userId].awadEmojiAll.push(awardEmojiList[1]);
      awardKeybord.reply_markup.keyboard.splice(
        0,
        1,
        users[userId].awadEmojiAll
      );
      await ctx.reply("💛 загляни в награды!");
      break;
    case 30:
      users[userId].awadEmojiAll.push(awardEmojiList[2]);
      awardKeybord.reply_markup.keyboard.splice(
        0,
        1,
        users[userId].awadEmojiAll
      );
      await ctx.reply("🧡 загляни в награды!");
      break;
    case 40:
      users[userId].awadEmojiAll.push(awardEmojiList[3]);
      awardKeybord.reply_markup.keyboard.splice(
        0,
        1,
        users[userId].awadEmojiAll
      );
      await ctx.reply("❤️ загляни в награды!");
      break;
    case 50:
      users[userId].awadEmojiAll.push(awardEmojiList[4]);
      awardKeybord.reply_markup.keyboard.splice(
        0,
        1,
        users[userId].awadEmojiAll
      );
      await ctx.reply("❤️‍🔥 загляни в награды!");
      break;
  }

  users[userId].drink = false;
  setTimeout(() => {
    users[userId].drink = true;
    timeWater(ctx, userId);
  }, 1000);

  const randomEmoji =
    emojiSuccess[Math.floor(Math.random() * emojiSuccess.length)];
  const randomFact = data.facts[Math.floor(Math.random() * data.facts.length)];

  saveUsers();

  const hours = Math.floor(users[userId].timeToNeed / 60);
  const minutes = users[userId].timeToNeed % 60;

  hours === 0
    ? await ctx.reply(
        `${randomEmoji} Следующий прием через ${minutes} мин!`,
        mainKeybord
      )
    : await ctx.reply(
        `${randomEmoji} Следующий прием через ${hours}час ${minutes}мин!`,
        mainKeybord
      );

  await ctx.reply(randomFact);
});

bot.hears("❌ Больше не напоминать!", async (ctx) => {
  const userId = ctx.from.id;
  users[userId].drink = false;
  timeWater(ctx, userId);
  ctx.reply("Хорошо!");
  saveUsers();
});

bot.hears("Времени осталось", (ctx) => {
  const userId = ctx.from.id;

  if (users[userId].drink) {
    const min = users[userId].timeToNeed - Math.floor(users[userId].time / 60);
    if (users[userId].time < 60)
      return ctx.reply(`Прошло только ${users[userId].time} сек о.о`);

    min < 60
      ? ctx.reply(`Осталось ${min} мин`)
      : ctx.reply(`${Math.floor(min / 60)} час ${min} мин`);
  } else {
    return ctx.reply("Вы еще не запустили время!");
  }
});

bot.hears("👑 Награды", async (ctx) => {
  const userId = ctx.from.id;

  if (!users[userId] || users[userId].timeDrink < 10) {
    ctx.reply("У тебя ещё нет наград :(");
  } else {
    awardKeybord.reply_markup.keyboard.splice(0, 1, users[userId].awadEmojiAll);
    ctx.reply("Награды 📈", awardKeybord);
  }
});

bot.hears("💚", async (ctx) => {
  await ctx.replyWithPhoto({ url: data.image["10"].src });
  await ctx.reply(data.image["10"].text, mainKeybord);
});
bot.hears("💛", async (ctx) => {
  await ctx.replyWithPhoto({ url: data.image["20"].src });
  await ctx.reply(data.image["20"].text, mainKeybord);
});
bot.hears("🧡", async (ctx) => {
  await ctx.replyWithPhoto({ url: data.image["30"].src });
  await ctx.reply(data.image["30"].text, mainKeybord);
});
bot.hears("❤️", async (ctx) => {
  await ctx.replyWithPhoto({ url: data.image["40"].src });
  await ctx.reply(data.image["40"].text, mainKeybord);
});
bot.hears("❤️‍🔥", async (ctx) => {
  await ctx.replyWithPhoto({ url: data.image["50"].src });
  await ctx.reply(data.image["50"].text, mainKeybord);
});

console.log("Start!!!");
bot.launch();
