require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');

let chatsThemes = {};

const govChatIdArr = [-4145453133, -4168599904, -4187356699, -4101563856, -4108240137, -4118911246, -4136291809, -4753833428, -1001468988358_896, -1001468988358]; // Массив с айдишниками чатов правления для игнорирования в них некоторых функций, вроде start и перенапраления сообщений

const themesDatas = [
    {
        name: 'water',
        buttonName: 'Вода',
        targetChatId: -4145453133
    },

    {
        name: 'electricity',
        buttonName: 'Электричество',
        targetChatId: -4168599904
    },

    {
        name: 'roads',
        buttonName: 'Дороги',
        targetChatId: -4187356699
    },

    {
        name: 'gas',
        buttonName: 'Газ',
        targetChatId: -4101563856
    },

    {
        name: 'payment',
        buttonName: 'Оплата взносов',
        targetChatId: -4108240137
    },

    {
        name: 'other',
        buttonName: 'Другой вопрос',
        targetChatId: -4118911246
    },

    {
        name: 'riders',
        buttonName: 'Попутчики',
        targetChatId: -1001468988358_896
    },

    {
        name: 'meeting',
        buttonName: 'К собранию',
        targetChatId: -4753833428
    },

    {
        name: 'topresident',
        buttonName: 'Председателю',
        targetChatId: -4136291809
    },

    {
        name: 'logs',
        buttonName: '',
        targetChatId: -1001801837649
    }

];

const bot = new Bot(process.env.BOT_API_KEY);

bot.use(hydrate());


const themeKeyboard = new InlineKeyboard() // Вводим значения для клавиш клавиатур
    .text('Вода', 'water')
    .text('Электричество', 'electricity').row()
    .text('Дороги', 'roads')
    .text('Газ', 'gas').row()
    .text('Оплата взносов','payment')
    .text('Другой вопрос', 'other').row()
    .text('Председателю', 'topresident')
    .text('К собранию', 'meeting').row()
    // .text('Попутчики','riders');

    // for (let i = 0; i < themesDatas.length; i++) {
    //     if (i % 2 === 0) {
    //         return .text(themesDatas[i].buttonName, themesDatas[i].name)
    //     } else {
    //         return .text(themesDatas[i].buttonName, themesDatas[i].name).row()
    //     }
    // }

const themeKeyboardBack = new InlineKeyboard()
.text('⬅️  Вернуться к списку тем', 'back')



// --------------- Команда запуска приема обращения

bot.command('start', async (ctx) => {
    let userChatId = ctx.update.message.chat.id;

    if (govChatIdArr.includes(userChatId)) {
        await ctx.reply('Извините, в данном чате функция /start недоступна');
    } 
    else {
        await ctx.reply('Здравствуйте! Я бот-секретарь правления СНТ "Ключи-4 восточные". Через меня ваше сообщение отправится сразу к ответственному лицу. \n \n Выберите, пожалуйста, тему обращения', {
            reply_markup: themeKeyboard
        });
    }
});

// ----------------- Команда вызова кнопки со ссылкой

bot.command('bot_link', async (ctx) => {
    const inlineKeyboard2 = new InlineKeyboard().url('Приступить', 'http://t.me/univer_appeal_bot?start=start');

    await ctx.reply('--\nВы можете отправить обращение в правление через электронного секретаря.\n \nПросто нажмите "Приступить", когда будете готовы.', {
        reply_markup: inlineKeyboard2
    });
});

// --------------------- Кнопки выбора тем

bot.callbackQuery('water', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Вода".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    let id = ctx.update.callback_query.from.id
    chatsThemes[ctx.update.callback_query.from.id] = 'water';
});

bot.callbackQuery('electricity', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Электричество".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'electricity';
});

bot.callbackQuery('roads', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Дороги".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'roads';
});

bot.callbackQuery('gas', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Газ".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'gas';
});

bot.callbackQuery('payment', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Оплата взносов".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'payment';
});

bot.callbackQuery('other', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Другой вопрос".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'other';
});

bot.callbackQuery('topresident', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Председателю".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'topresident';
});

bot.callbackQuery('meeting', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "К собранию".\n \nПожалуйста, отправьте обращение следующим сообщением. Начните его с вашей фамилии, имени, отчества и номера участка.\n \n❗️  Важно: обращение должно быть отправлено одним сообщением. Допускается прикреплять фото и видео.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'meeting';
});

bot.callbackQuery('riders', async (ctx) => {
    await ctx.callbackQuery.message.editText('✅  Вы выбрали тему обращения "Попутчики".\n \nПожалуйста, отправьте обращение следующим сообщением по форме:\n \n1. Направление (откуда и куда)\n \n2. Количество человек\n \n3. Время желаемого отъезда\n \n❗️  Важно: обращение должно быть отправлено одним сообщением.', {
        reply_markup: themeKeyboardBack
    });
    await ctx.answerCallbackQuery();
    chatsThemes[ctx.update.callback_query.from.id] = 'riders';
});

// ---------------------- Кнопка назад

bot.callbackQuery('back', async (ctx) => {
    chatsThemes[ctx.update.callback_query.from.id] = '0';
    await ctx.callbackQuery.message.editText('Выберите, пожалуйста, тему обращения.', {
        reply_markup: themeKeyboard
    });
    await ctx.answerCallbackQuery();
});

// -------------------  Пересылаем сообщения от пользователя

bot.on('message', async (ctx) => {

    let userChatId = ctx.update.message.chat.id;

    if ((chatsThemes[ctx.update.message.from.id] === 'water')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4145453133);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    } 

    else if ((chatsThemes[ctx.update.message.from.id] === 'electricity')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4168599904);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    }

    else if ((chatsThemes[ctx.update.message.from.id] === 'roads')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4187356699);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    }

    else if ((chatsThemes[ctx.update.message.from.id] === 'gas')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4101563856);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    }

    else if ((chatsThemes[ctx.update.message.from.id] === 'payment')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4108240137);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    }

    else if ((chatsThemes[ctx.update.message.from.id] === 'other')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4118911246);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    }

    else if ((chatsThemes[ctx.update.message.from.id] === 'topresident')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4136291809);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    } 

    else if ((chatsThemes[ctx.update.message.from.id] === 'meeting')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-4753833428);
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    } 

    else if ((chatsThemes[ctx.update.message.from.id] === 'riders')&&(!govChatIdArr.includes(userChatId))) {
        await ctx.forwardMessage(-1001468988358896_896); // Пересылка в подчаты не работает, только в корневой
        await ctx.forwardMessage(-1001801837649);
        chatsThemes[ctx.update.message.from.id] = 0;
        await ctx.reply('Ваше обращение перенаправлено в чат "Попутчики".\n \nСпасибо, что доверили это мне 😊');
    } 
    
    else if ((govChatIdArr.includes(userChatId))&&
    (ctx.update.message.reply_to_message.from.id === 6949227372)&&
    (ctx.update.message.reply_to_message.forward_origin.sender_user.id)) {
        await bot.api.sendMessage(ctx.update.message.reply_to_message.forward_origin.sender_user.id, 'Доброго времени суток. \n \nВам отправлен официальный ответ на ранее оставленное обращение.\n \nМожете ознакомиться с ним ниже');
        await ctx.forwardMessage(ctx.update.message.reply_to_message.forward_origin.sender_user.id);
    } 

    else if (govChatIdArr.includes(userChatId)) {  
    } 
    
    else {
        await ctx.reply('Извините, но вы не указали тему обращения. Давайте начнем сначала. Нажмите /start')
    }
})


// ------------------ Установка команд в меню

bot.api.setMyCommands([

    {
        command: 'start',
        description: 'Подать обращение в правление'
    },

]);


// ------------------  Перехват ошибок

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while landling update ${ctx.update.update_id}:`);
    const e = err.error;

    if (e instanceof GrammyError) {
        console.log("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.log("Could not contact Telegram:", e);
    } else {
        console.log("Unknown error:", e);
    }
})


bot.start();
