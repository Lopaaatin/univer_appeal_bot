require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');

let chatsThemes = {};

// Буфер для медиа-групп (альбомов) с динамическим ожиданием
const mediaGroupBuffer = {};

// Хранилище: message_id отправленного в чат правления сообщения -> userId отправителя
const sentMessageToUser = {};

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
    const userId = ctx.update.message.from.id;
    const mediaGroupId = ctx.msg.media_group_id;

    // Функция для получения целевого чата по теме
    const getTargetChatId = (theme) => {
        const themeData = themesDatas.find(t => t.name === theme);
        return themeData ? themeData.targetChatId : null;
    };

    // Функция пересылки одного сообщения (не группа) в целевой чат и лог-канал
    const forwardSingleMessage = async (message, targetChatId, logsChatId, originalUserId) => {
        try {
            // Пересылаем в чат правления и запоминаем ID отправленного сообщения
            const sentInTarget = await ctx.api.forwardMessage(targetChatId, message.chat.id, message.message_id);
            sentMessageToUser[sentInTarget.message_id] = originalUserId;
            
            // Пересылаем в лог-канал
            const sentInLogs = await ctx.api.forwardMessage(logsChatId, message.chat.id, message.message_id);
            sentMessageToUser[sentInLogs.message_id] = originalUserId;
        } catch (e) {
            console.error('Ошибка пересылки:', e);
        }
    };

    // Функция отправки альбома (медиа-группы) в целевой чат и лог-канал
    const sendMediaGroupToChats = async (mediaGroupArray, targetChatId, logsChatId, originalUserId) => {
        try {
            // Отправляем в целевой чат и запоминаем все message_id
            const sentTarget = await ctx.api.sendMediaGroup(targetChatId, mediaGroupArray);
            for (const msg of sentTarget) {
                sentMessageToUser[msg.message_id] = originalUserId;
            }
            
            // Отправляем в лог-канал
            const sentLogs = await ctx.api.sendMediaGroup(logsChatId, mediaGroupArray);
            for (const msg of sentLogs) {
                sentMessageToUser[msg.message_id] = originalUserId;
            }
        } catch (e) {
            console.error('Ошибка отправки медиа-группы:', e);
        }
    };

    // --- Обработка ответов из чатов правления (универсальная логика) ---
    if (govChatIdArr.includes(userChatId) && ctx.update.message.reply_to_message) {
        const repliedMsgId = ctx.update.message.reply_to_message.message_id;
        const originalUserId = sentMessageToUser[repliedMsgId];
        
        if (originalUserId) {
            // Отправляем пользователю уведомление
            await bot.api.sendMessage(originalUserId, 'Доброго времени суток. \n \nВам отправлен официальный ответ на ранее оставленное обращение.\n \nМожете ознакомиться с ним ниже');
            // Пересылаем ответное сообщение пользователю
            await ctx.forwardMessage(originalUserId);
        }
        return;
    }

    // Если сообщение из чата правления, но не ответ на обращение – игнорируем
    if (govChatIdArr.includes(userChatId)) {
        return;
    }

    const currentTheme = chatsThemes[userId];

    if (!currentTheme || currentTheme === '0') {
        await ctx.reply('Извините, но вы не указали тему обращения. Давайте начнем сначала. Нажмите /start');
        return;
    }

    const targetChatId = getTargetChatId(currentTheme);
    const logsChatId = -1001801837649; // канал с логами

    if (!targetChatId) {
        console.error(`Не найден целевой чат для темы ${currentTheme}`);
        await ctx.reply('Произошла ошибка: тема не распознана. Пожалуйста, начните заново с /start');
        chatsThemes[userId] = '0';
        return;
    }

    // --- Обработка медиа-групп (альбомов) с динамическим ожиданием ---
    if (mediaGroupId) {
        const bufferKey = `${mediaGroupId}_${userId}`;

        if (!mediaGroupBuffer[bufferKey]) {
            mediaGroupBuffer[bufferKey] = {
                messages: [],
                theme: currentTheme,
                timeout: null
            };
        }

        const buffer = mediaGroupBuffer[bufferKey];
        buffer.messages.push(ctx.msg);

        if (buffer.timeout) clearTimeout(buffer.timeout);

        // Динамическое ожидание: после последнего сообщения ждём 2 секунды
        buffer.timeout = setTimeout(async () => {
            const messages = buffer.messages;
            // Сортируем сообщения по порядку (Telegram не гарантирует, но обычно приходят в правильном порядке)
            messages.sort((a, b) => a.message_id - b.message_id);

            // Преобразуем сообщения в формат InputMedia для sendMediaGroup
            const inputMediaArray = [];
            let caption = null;
            let captionEntities = null;

            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                let mediaType = null;
                let fileId = null;

                // Определяем тип медиа и получаем file_id
                if (msg.photo) {
                    const photo = msg.photo[msg.photo.length - 1];
                    fileId = photo.file_id;
                    mediaType = 'photo';
                } else if (msg.video) {
                    fileId = msg.video.file_id;
                    mediaType = 'video';
                } else {
                    // Неподдерживаемый тип – пересылаем как обычное сообщение
                    await forwardSingleMessage(msg, targetChatId, logsChatId, userId);
                    continue;
                }

                if (i === 0) {
                    caption = msg.caption || '';
                    captionEntities = msg.caption_entities;
                }

                let inputMedia;
                if (mediaType === 'photo') {
                    inputMedia = { type: 'photo', media: fileId };
                } else {
                    inputMedia = { type: 'video', media: fileId };
                }

                if (i === 0 && caption) {
                    inputMedia.caption = caption;
                    if (captionEntities) {
                        inputMedia.caption_entities = captionEntities;
                    }
                }

                inputMediaArray.push(inputMedia);
            }

            if (inputMediaArray.length > 0) {
                await sendMediaGroupToChats(inputMediaArray, targetChatId, logsChatId, userId);
            }

            await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
            chatsThemes[userId] = '0';
            delete mediaGroupBuffer[bufferKey];
        }, 2000);

        return;
    }

    // --- Обычное сообщение (не медиа-группа) ---
    await forwardSingleMessage(ctx.msg, targetChatId, logsChatId, userId);
    await ctx.reply('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    chatsThemes[userId] = '0';
});


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